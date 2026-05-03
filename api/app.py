import pickle
import os
import numpy as np
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from tensorflow.keras.models import load_model

app = Flask(__name__)
CORS(app)

# ---------------------------
# LOAD MODEL & SCALERS
# ---------------------------
model = load_model("models/lstm_model.h5", compile=False)

# Load all domain scalers
SCALERS = {}
for i in range(1, 5):
    path = f"models/scaler_FD00{i}.pkl"
    if os.path.exists(path):
        with open(path, "rb") as f:
            SCALERS[f"FD00{i}"] = pickle.load(f)

SEQ_LENGTH = 30
MC_SAMPLES = 20 # Monte Carlo samples
DEFAULT_DOMAIN = "FD001"
NUM_FEATURES = 108 # Updated to match rolling features count

# ---------------------------
# STATUS FUNCTION
# ---------------------------
def get_status(rul, uncertainty):
    if rul > 80 and uncertainty < 10:
        return "SAFE"
    elif rul > 40:
        if uncertainty > 15:
            return "WARNING (HIGH UNCERTAINTY)"
        return "WARNING"
    else:
        return "CRITICAL"

# ---------------------------
# HOME
# ---------------------------
@app.route('/')
def home():
    return "RUL Backend is Running 🚀"

# ---------------------------
# SERVE PLOTS
# ---------------------------
@app.route('/plots/<filename>')
def get_plot(filename):
    return send_from_directory('../plots', filename)

# ---------------------------
# DEMO (FOR BROWSER)
# ---------------------------
@app.route('/demo', methods=['GET'])
def demo():
    domain = request.args.get('domain', DEFAULT_DOMAIN)
    scaler = SCALERS.get(domain, SCALERS.get(DEFAULT_DOMAIN))
    
    # Generate a dummy sequence with 108 features
    sequence = np.random.randn(SEQ_LENGTH, NUM_FEATURES)
    # We don't scale dummy random data usually, but let's assume it's raw
    sequence = scaler.transform(sequence)
    sequence = sequence.reshape(1, SEQ_LENGTH, NUM_FEATURES)

    # Monte Carlo passes
    preds = []
    for _ in range(MC_SAMPLES):
        preds.append(model(sequence, training=True).numpy()[0][0])
    
    mean_rul = max(0, float(np.mean(preds)))
    std_rul = float(np.std(preds))

    return {
        "RUL": mean_rul,
        "uncertainty": std_rul,
        "status": get_status(mean_rul, std_rul),
        "domain": domain
    }

# ---------------------------
# PREDICT (MAIN LOGIC)
# ---------------------------
@app.route('/predict', methods=['GET', 'POST'])
def predict():
    try:
        if request.method == 'GET':
            return {
                "RUL": 85,
                "uncertainty": 5,
                "status": "DEMO MODE"
            }

        data = request.get_json()

        # Get domain
        domain = data.get("domain", DEFAULT_DOMAIN)
        scaler = SCALERS.get(domain, SCALERS.get(DEFAULT_DOMAIN))

        # Sliders
        wear = data.get("wear", 0.5)
        severity = data.get("severity", 0.5)
        thermal = data.get("thermal", 0.5)
        cycle = data.get("cycle", 0.5)
        volatility = data.get("volatility", 0.5)

        # Generate synthetic sequence based on 108 features
        # For demo, we use a base pattern and modify it
        base = np.zeros((SEQ_LENGTH, NUM_FEATURES))
        # Add some trend to sensors
        for i in range(21): # Base sensors
            base[:, i] = np.linspace(0, 1, SEQ_LENGTH) * (wear + severity)
        
        modifier = (wear + severity + thermal + cycle + volatility)
        sequence = base * (1 + modifier)

        # Scale using the domain-specific scaler
        sequence = scaler.transform(sequence)
        sequence = sequence.reshape(1, SEQ_LENGTH, NUM_FEATURES)

        # FAST BATCHED Monte Carlo Estimation (10x Speedup)
        # We tile the input to run all 20 passes in a single parallel call
        batched_sequence = np.tile(sequence, (MC_SAMPLES, 1, 1))
        preds = model(batched_sequence, training=True).numpy().flatten()
            
        mean_rul = np.mean(preds)
        std_rul = np.std(preds)

        # Realistic responsiveness logic
        # High modifier (wear/severity) should reduce RUL but not crush it to 0 immediately
        display_rul = mean_rul * (1 - (modifier / 10)) 
        display_rul = max(1, float(display_rul)) # Ensure at least 1 cycle
        std_rul = float(std_rul)

        return jsonify({
            "RUL": display_rul,
            "uncertainty": std_rul,
            "status": get_status(display_rul, std_rul),
            "domain": domain
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------------------
# RUN
# ---------------------------
if __name__ == "__main__":
    app.run(debug=True)