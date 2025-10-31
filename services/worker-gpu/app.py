from flask import Flask, request, jsonify
import os
import logging
from dotenv import load_dotenv
from pipeline import generate_baby_pet
from s3_utils import download_from_s3, upload_to_s3
import requests

load_dotenv()

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'gpu_available': check_gpu()}), 200

@app.route('/generate', methods=['POST'])
def generate():
    """
    Main generation endpoint called by the API server
    
    Expected payload:
    {
        "job_id": "cuid",
        "pet_type": "cat" | "dog",
        "image_keys": ["s3-key-1", "s3-key-2"],
        "breed": "optional breed name",
        "watermark": true/false,
        "callback_url": "http://api:3000/internal/worker-callback"
    }
    """
    try:
        data = request.json
        job_id = data['job_id']
        pet_type = data['pet_type']
        image_keys = data['image_keys']
        breed = data.get('breed')
        watermark = data.get('watermark', True)
        callback_url = data['callback_url']
        
        logger.info(f"📥 Received job {job_id}: {pet_type}, {len(image_keys)} images")
        
        # Download input images from S3
        input_images = []
        for key in image_keys:
            image_path = download_from_s3(key)
            input_images.append(image_path)
        
        # Run the generation pipeline
        result_path = generate_baby_pet(
            input_images=input_images,
            pet_type=pet_type,
            breed=breed,
            watermark=watermark,
            job_id=job_id
        )
        
        # Upload result to S3
        result_key = f"results/{job_id}.jpg"
        upload_to_s3(result_path, result_key)
        
        logger.info(f"✅ Job {job_id} completed: {result_key}")
        
        # Callback to API server
        callback_payload = {
            'jobId': job_id,
            'success': True,
            'resultKey': result_key
        }
        
        try:
            requests.post(callback_url, json=callback_payload, timeout=10)
        except Exception as e:
            logger.error(f"Failed to call back: {e}")
        
        return jsonify({
            'success': True,
            'job_id': job_id,
            'result_key': result_key
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Job {job_id} failed: {str(e)}")
        
        # Callback with error
        try:
            callback_payload = {
                'jobId': job_id,
                'success': False,
                'error': str(e)
            }
            requests.post(callback_url, json=callback_payload, timeout=10)
        except:
            pass
        
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def check_gpu():
    try:
        import torch
        return torch.cuda.is_available()
    except:
        return False

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

