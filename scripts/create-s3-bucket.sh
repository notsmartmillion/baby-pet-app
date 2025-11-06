#!/bin/bash

# Create S3 bucket for local development using LocalStack
# Usage: ./scripts/create-s3-bucket.sh

BUCKET_NAME="kittypup-uploads"
ENDPOINT_URL="http://localhost:4566"

echo "Creating S3 bucket: $BUCKET_NAME"

aws --endpoint-url=$ENDPOINT_URL \
    s3 mb s3://$BUCKET_NAME \
    --region us-east-1

echo "✅ Bucket created: $BUCKET_NAME"

# Set CORS (for direct browser uploads if needed)
aws --endpoint-url=$ENDPOINT_URL \
    s3api put-bucket-cors \
    --bucket $BUCKET_NAME \
    --cors-configuration '{
      "CORSRules": [
        {
          "AllowedOrigins": ["*"],
          "AllowedMethods": ["GET", "PUT", "POST"],
          "AllowedHeaders": ["*"],
          "MaxAgeSeconds": 3000
        }
      ]
    }'

echo "✅ CORS configured"

