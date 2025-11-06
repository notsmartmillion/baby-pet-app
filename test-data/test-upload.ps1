#!/usr/bin/env pwsh
# Test script to simulate mobile app upload flow
# Tests: Image upload -> Job creation -> GPU processing -> Result

param(
    [string]$ApiUrl = "http://localhost:3000",
    [string]$PetType = "cat",
    [string]$ImagePattern = "*.jpg"
)

# Load System.Web for URL encoding
Add-Type -AssemblyName System.Web

Write-Host "Kittypup - Integration Test" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if API is running
Write-Host "Checking API health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$ApiUrl/health" -Method Get
    Write-Host "  API Status: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: API is not running at $ApiUrl" -ForegroundColor Red
    Write-Host "  Run: npm run dev:api" -ForegroundColor Yellow
    exit 1
}

# Get test images from test-data directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$images = Get-ChildItem -Path $scriptDir -Filter $ImagePattern

if ($images.Count -eq 0) {
    Write-Host ""
    Write-Host "No test images found in test-data/" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please add 1-6 JPG images of a cat or dog to test-data/" -ForegroundColor Yellow
    Write-Host "You can download from:" -ForegroundColor Yellow
    Write-Host "  - https://unsplash.com/s/photos/cat" -ForegroundColor White
    Write-Host "  - https://unsplash.com/s/photos/dog" -ForegroundColor White
    Write-Host ""
    exit 1
}

$imageCount = [Math]::Min($images.Count, 6)
$testImages = $images | Select-Object -First $imageCount

Write-Host "Found $($testImages.Count) test image(s)" -ForegroundColor Green
Write-Host ""

# Step 1: Upload images and get S3 keys
Write-Host "Step 1: Uploading images to S3..." -ForegroundColor Cyan
$imageKeys = @()

foreach ($image in $testImages) {
    Write-Host "  Uploading: $($image.Name)" -ForegroundColor White
    
    # Get presigned URL from API (tRPC format)
    $uploadInput = @{
        fileName = $image.Name
        contentType = "image/jpeg"
    } | ConvertTo-Json -Compress
    
    # URL encode the input
    $encodedInput = [System.Web.HttpUtility]::UrlEncode($uploadInput)
    
    try {
        $response = Invoke-RestMethod -Uri "$ApiUrl/trpc/getUploadUrl?input=$encodedInput" `
            -Method Get `
            -Headers @{"x-user-id" = "test-user-123"}
        
        $uploadUrl = $response.result.data.uploadUrl
        $fileKey = $response.result.data.fileKey
        
        # Upload to S3
        $imageBytes = [System.IO.File]::ReadAllBytes($image.FullName)
        Invoke-RestMethod -Uri $uploadUrl `
            -Method Put `
            -Body $imageBytes `
            -ContentType "image/jpeg" | Out-Null
        
        $imageKeys += $fileKey
        Write-Host "    Uploaded: $fileKey" -ForegroundColor Green
    } catch {
        Write-Host "    ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

if ($imageKeys.Count -eq 0) {
    Write-Host ""
    Write-Host "ERROR: Failed to upload any images" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Creating generation job..." -ForegroundColor Cyan

$jobInput = @{
    petType = $PetType
    imageKeys = $imageKeys
} | ConvertTo-Json -Compress

$encodedJobInput = [System.Web.HttpUtility]::UrlEncode($jobInput)

try {
    $jobResponse = Invoke-RestMethod -Uri "$ApiUrl/trpc/createJob?input=$encodedJobInput" `
        -Method Get `
        -Headers @{"x-user-id" = "test-user-123"}
    
    $jobId = $jobResponse.result.data.id
    Write-Host "  Job created: $jobId" -ForegroundColor Green
    Write-Host "  Status: $($jobResponse.result.data.status)" -ForegroundColor White
} catch {
    Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Polling for completion..." -ForegroundColor Cyan
Write-Host "  (This will take 10-20 seconds for real generation)" -ForegroundColor Gray
Write-Host ""

$maxAttempts = 30
$attempt = 0
$job = $null

while ($attempt -lt $maxAttempts) {
    $attempt++
    Start-Sleep -Seconds 2
    
    try {
        $jobQueryInput = @{
            jobId = $jobId
        } | ConvertTo-Json -Compress
        
        $encodedQuery = [System.Web.HttpUtility]::UrlEncode($jobQueryInput)
        
        $jobResponse = Invoke-RestMethod -Uri "$ApiUrl/trpc/getJob?input=$encodedQuery" `
            -Method Get `
            -Headers @{"x-user-id" = "test-user-123"}
        
        $job = $jobResponse.result.data
        
        Write-Host "  [$attempt/$maxAttempts] Status: $($job.status)" -ForegroundColor Yellow
        
        if ($job.status -eq "completed") {
            Write-Host ""
            Write-Host "SUCCESS! Job completed" -ForegroundColor Green
            Write-Host "  Result URL: $($job.resultUrl)" -ForegroundColor White
            Write-Host "  Watermarked: $($job.isWatermarked)" -ForegroundColor White
            
            # Download result
            if ($job.resultUrl) {
                $resultPath = Join-Path $scriptDir "result-$jobId.jpg"
                Invoke-WebRequest -Uri $job.resultUrl -OutFile $resultPath
                Write-Host "  Saved to: $resultPath" -ForegroundColor Green
            }
            
            break
        } elseif ($job.status -eq "failed") {
            Write-Host ""
            Write-Host "FAILED: $($job.error)" -ForegroundColor Red
            break
        }
    } catch {
        Write-Host "  ERROR polling job: $($_.Exception.Message)" -ForegroundColor Red
    }
}

if ($attempt -ge $maxAttempts) {
    Write-Host ""
    Write-Host "TIMEOUT: Job did not complete in time" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test complete!" -ForegroundColor Cyan
Write-Host ""

