import logging
from waitress import serve
from app import app

# Configure basic logging for Waitress
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('waitress')
logger.setLevel(logging.INFO)

import os

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting production server on http://0.0.0.0:{port}")
    print("Press Ctrl+C to stop.")
    # Run the Waitress WSGI server
    serve(app, host='0.0.0.0', port=port, threads=6)
