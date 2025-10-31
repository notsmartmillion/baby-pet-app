"""
S3 utilities for downloading inputs and uploading results
"""

import os
import boto3
from botocore.exceptions import ClientError
import logging

logger = logging.getLogger(__name__)

# Initialize S3 client
s3_client = boto3.client(
    's3',
    region_name=os.getenv('AWS_REGION', 'us-east-1'),
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
)

BUCKET = os.getenv('S3_BUCKET', 'baby-pet-uploads')
DOWNLOAD_DIR = os.getenv('DOWNLOAD_DIR', '/tmp/downloads')

def download_from_s3(s3_key: str) -> str:
    """
    Download file from S3 to local temp directory
    Returns local file path
    """
    os.makedirs(DOWNLOAD_DIR, exist_ok=True)
    
    # Create local filename from S3 key
    filename = s3_key.split('/')[-1]
    local_path = os.path.join(DOWNLOAD_DIR, filename)
    
    try:
        logger.info(f"⬇️ Downloading s3://{BUCKET}/{s3_key}")
        s3_client.download_file(BUCKET, s3_key, local_path)
        logger.info(f"✅ Downloaded to {local_path}")
        return local_path
    except ClientError as e:
        logger.error(f"❌ S3 download failed: {e}")
        raise

def upload_to_s3(local_path: str, s3_key: str) -> str:
    """
    Upload file to S3
    Returns S3 key
    """
    try:
        logger.info(f"⬆️ Uploading {local_path} to s3://{BUCKET}/{s3_key}")
        s3_client.upload_file(
            local_path,
            BUCKET,
            s3_key,
            ExtraArgs={'ContentType': 'image/jpeg'}
        )
        logger.info(f"✅ Uploaded to s3://{BUCKET}/{s3_key}")
        return s3_key
    except ClientError as e:
        logger.error(f"❌ S3 upload failed: {e}")
        raise

