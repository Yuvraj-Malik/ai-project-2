import pickle
import os
import numpy as np
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from tensorflow.keras.models import load_model

app = Flask(__name__, static_folder='../frontend/dist', static_url_path='/')
# Robust CORS: allows all origins, methods, and headers
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return response

# Explicitly handle preflight OPTIONS requests for all routes
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def preflight(path):
    response = app.make_response("")
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return response

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
MC_SAMPLES = 3 # Minimal samples for free tier stability
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
# SERVE FRONTEND (REACT APP)
# ---------------------------
@app.route('/')
def serve_index():
    return app.send_static_file('index.html')

@app.route('/<path:path>')
def serve_static_or_index(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return app.send_static_file('index.html')

# ---------------------------
# SERVE PLOTS
# ---------------------------
@app.route('/plots/<filename>')
def get_plot(filename):
    return send_from_directory('../plots', filename)

# ---------------------------
# HEALTH CHECK
# ---------------------------
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200

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
# FEATURE LIST (Internal Mapping)
# ---------------------------
FEATURE_NAMES = ['op_setting_1', 'op_setting_2', 'op_setting_3', 'sensor_1', 'sensor_10', 'sensor_10_rollmean_10', 'sensor_10_rollmean_5', 'sensor_10_rollstd_10', 'sensor_10_rollstd_5', 'sensor_11', 'sensor_11_rollmean_10', 'sensor_11_rollmean_5', 'sensor_11_rollstd_10', 'sensor_11_rollstd_5', 'sensor_12', 'sensor_12_rollmean_10', 'sensor_12_rollmean_5', 'sensor_12_rollstd_10', 'sensor_12_rollstd_5', 'sensor_13', 'sensor_13_rollmean_10', 'sensor_13_rollmean_5', 'sensor_13_rollstd_10', 'sensor_13_rollstd_5', 'sensor_14', 'sensor_14_rollmean_10', 'sensor_14_rollmean_5', 'sensor_14_rollstd_10', 'sensor_14_rollstd_5', 'sensor_15', 'sensor_15_rollmean_10', 'sensor_15_rollmean_5', 'sensor_15_rollstd_10', 'sensor_15_rollstd_5', 'sensor_16', 'sensor_16_rollmean_10', 'sensor_16_rollmean_5', 'sensor_16_rollstd_10', 'sensor_16_rollstd_5', 'sensor_17', 'sensor_17_rollmean_10', 'sensor_17_rollmean_5', 'sensor_17_rollstd_10', 'sensor_17_rollstd_5', 'sensor_18', 'sensor_18_rollmean_10', 'sensor_18_rollmean_5', 'sensor_18_rollstd_10', 'sensor_18_rollstd_5', 'sensor_19', 'sensor_19_rollmean_10', 'sensor_19_rollmean_5', 'sensor_19_rollstd_10', 'sensor_19_rollstd_5', 'sensor_1_rollmean_10', 'sensor_1_rollmean_5', 'sensor_1_rollstd_10', 'sensor_1_rollstd_5', 'sensor_2', 'sensor_20', 'sensor_20_rollmean_10', 'sensor_20_rollmean_5', 'sensor_20_rollstd_10', 'sensor_20_rollstd_5', 'sensor_21', 'sensor_21_rollmean_10', 'sensor_21_rollmean_5', 'sensor_21_rollstd_10', 'sensor_21_rollstd_5', 'sensor_2_rollmean_10', 'sensor_2_rollmean_5', 'sensor_2_rollstd_10', 'sensor_2_rollstd_5', 'sensor_3', 'sensor_3_rollmean_10', 'sensor_3_rollmean_5', 'sensor_3_rollstd_10', 'sensor_3_rollstd_5', 'sensor_4', 'sensor_4_rollmean_10', 'sensor_4_rollmean_5', 'sensor_4_rollstd_10', 'sensor_4_rollstd_5', 'sensor_5', 'sensor_5_rollmean_10', 'sensor_5_rollmean_5', 'sensor_5_rollstd_10', 'sensor_5_rollstd_5', 'sensor_6', 'sensor_6_rollmean_10', 'sensor_6_rollmean_5', 'sensor_6_rollstd_10', 'sensor_6_rollstd_5', 'sensor_7', 'sensor_7_rollmean_10', 'sensor_7_rollmean_5', 'sensor_7_rollstd_10', 'sensor_7_rollstd_5', 'sensor_8', 'sensor_8_rollmean_10', 'sensor_8_rollmean_5', 'sensor_8_rollstd_10', 'sensor_8_rollstd_5', 'sensor_9', 'sensor_9_rollmean_10', 'sensor_9_rollmean_5', 'sensor_9_rollstd_10', 'sensor_9_rollstd_5']

def synthesize_sequence(sliders, domain="FD001"):
    """
    Creates a realistic 30-cycle sequence from 5 UI sliders.
    Maps UI signals to physical sensor degradation patterns.
    """
    wear = sliders.get("wear", 0.5)
    severity = sliders.get("severity", 0.5)
    thermal = sliders.get("thermal", 0.5)
    cycle_val = sliders.get("cycle", 0.5)
    volatility = sliders.get("volatility", 0.5)

    # Sensors that INCREASE with degradation
    inc_sensors = [2, 3, 4, 7, 8, 11, 12, 13, 15, 17, 20, 21]
    # Sensors that DECREASE with degradation
    dec_sensors = [1, 5, 6, 9, 10, 14, 16, 18, 19]

    # Initialize sequence (30 cycles, 108 features)
    seq = np.zeros((SEQ_LENGTH, NUM_FEATURES))
    
    # Fill based on feature names
    for i, name in enumerate(FEATURE_NAMES):
        # Default value
        val = 0.0
        
        # Operational settings (affected by severity)
        if 'op_setting' in name:
            val = severity * 2.0
            
        # Raw sensors
        elif 'sensor' in name and 'roll' not in name:
            s_num = int(name.split('_')[1])
            if s_num in inc_sensors:
                # Value increases with wear and thermal
                val = (wear * 10.0) + (thermal * 5.0) + (cycle_val * 2.0)
            elif s_num in dec_sensors:
                # Value decreases with wear
                val = -(wear * 15.0) - (cycle_val * 5.0)
                
        # Rolling Mean (matches the trend of raw sensors)
        elif 'rollmean' in name:
            s_num = int(name.split('_')[1])
            if s_num in inc_sensors:
                val = (wear * 10.0) + (thermal * 5.0) + (cycle_val * 2.0)
            elif s_num in dec_sensors:
                val = -(wear * 15.0) - (cycle_val * 5.0)
                
        # Rolling Std (affected primarily by volatility)
        elif 'rollstd' in name:
            val = (volatility * 5.0) + (wear * 2.0)

        # Add a bit of natural temporal progression across the 30 cycles
        # The later cycles in the sequence should look more degraded
        for t in range(SEQ_LENGTH):
            temporal_progression = (t / SEQ_LENGTH) * (wear * 2.0)
            if any(str(s) in name for s in inc_sensors):
                seq[t, i] = val + temporal_progression
            else:
                seq[t, i] = val - temporal_progression

    # Scale the entire sequence using the domain-specific scaler
    scaler = SCALERS.get(domain, SCALERS.get(DEFAULT_DOMAIN))
    # Reshape for transform (N*T, features)
    seq_flat = seq.reshape(-1, NUM_FEATURES)
    seq_scaled = scaler.transform(seq_flat)
    # Reshape back for model (1, 30, 108)
    return seq_scaled.reshape(1, SEQ_LENGTH, NUM_FEATURES)

# ---------------------------
# PREDICT (MAIN LOGIC)
# ---------------------------
@app.route('/predict', methods=['GET', 'POST'])
def predict():
    try:
        if request.method == 'GET':
            return jsonify({"RUL": 85, "uncertainty": 5, "status": "DEMO MODE"})

        data = request.get_json() or {}
        domain = data.get("domain", DEFAULT_DOMAIN)
        
        # 1. Synthesize input sequence from sliders
        sequence = synthesize_sequence(data, domain)
        
        # 2. Run model inference (Monte Carlo Dropout for uncertainty)
        preds = []
        # Using MC_SAMPLES = 3 for performance, can be increased for higher precision
        for _ in range(MC_SAMPLES):
            # training=True enables Dropout at inference time
            pred = model(sequence, training=True).numpy()[0][0]
            preds.append(pred)
        
        # 3. Compute statistics
        mean_rul = float(np.mean(preds))
        # Ensure RUL doesn't exceed training cap or go below 1 realistically
        mean_rul = max(1.0, min(125.0, mean_rul))
        std_rul = float(np.std(preds))
        
        # 4. Final Response
        return jsonify({
            "RUL": round(mean_rul, 1),
            "uncertainty": round(std_rul, 1),
            "status": get_status(mean_rul, std_rul),
            "domain": domain
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ---------------------------
# RUN
# ---------------------------
if __name__ == "__main__":
    app.run(debug=True)