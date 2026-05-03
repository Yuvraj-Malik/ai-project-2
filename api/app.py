import pickle
import os
import numpy as np
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
try:
    from tensorflow.keras.models import load_model
    HAS_TF = True
except ImportError:
    HAS_TF = False

app = Flask(__name__, static_folder='../frontend/dist', static_url_path='/')
# Simplified CORS: allows necessary origins for the project
CORS(app, resources={r"/*": {"origins": ["https://rrlstm.netlify.app", "http://localhost:5173", "http://localhost:3000"]}})

model = None

def load_lstm_model():
    global model
    if model is not None:
        return model
    
    if HAS_TF:
        try:
            print("Loading LSTM model...")
            model = load_model("models/lstm_model.h5", compile=False)
            print("Model loaded successfully.")
        except Exception as e:
            print(f"Warning: Could not load model: {e}")
            model = None
    else:
        print("Warning: TensorFlow not found. Running in MOCK MODE.")
        model = None
    return model


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
    current_model = load_lstm_model()
    if current_model:
        for _ in range(MC_SAMPLES):
            preds.append(current_model(sequence, training=True).numpy()[0][0])
    else:
        # Mock prediction logic
        preds = [85.0 + np.random.randn() * 2 for _ in range(MC_SAMPLES)]
    
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

# Realistic Means and Scales from NASA C-MAPSS FD001
# Used to synthesize data that stays within the model's expected distribution
MEANS = {
    'op_setting_1': -8.87e-06, 'op_setting_2': 2.35e-06, 'op_setting_3': 100.0,
    'sensor_1': 518.67, 'sensor_2': 642.68, 'sensor_3': 1590.52, 'sensor_4': 1408.93,
    'sensor_5': 14.62, 'sensor_6': 21.61, 'sensor_7': 553.37, 'sensor_8': 2388.10,
    'sensor_9': 9065.24, 'sensor_10': 1.3, 'sensor_11': 47.54, 'sensor_12': 521.41,
    'sensor_13': 2388.10, 'sensor_14': 8143.75, 'sensor_15': 8.44, 'sensor_16': 0.03,
    'sensor_17': 393.21, 'sensor_18': 2388.0, 'sensor_19': 100.0, 'sensor_20': 38.82,
    'sensor_21': 23.29
}
SCALES = {
    'op_setting_1': 0.002, 'op_setting_2': 0.0003, 'op_setting_3': 1.0,
    'sensor_1': 1.0, 'sensor_2': 0.5, 'sensor_3': 6.13, 'sensor_4': 9.0,
    'sensor_5': 1.0, 'sensor_6': 0.001, 'sensor_7': 0.88, 'sensor_8': 0.07,
    'sensor_9': 22.08, 'sensor_10': 1.0, 'sensor_11': 0.27, 'sensor_12': 0.74,
    'sensor_13': 0.07, 'sensor_14': 19.08, 'sensor_15': 0.04, 'sensor_16': 1.0,
    'sensor_17': 1.55, 'sensor_18': 1.0, 'sensor_19': 1.0, 'sensor_20': 0.18,
    'sensor_21': 0.11
}

def synthesize_sequence(sliders, domain="FD001"):
    """
    Creates a realistic 30-cycle sequence from 5 UI sliders.
    Uses real dataset means and scales to stay in-distribution.
    """
    wear = sliders.get("wear", 0.5)
    severity = sliders.get("severity", 0.5)
    thermal = sliders.get("thermal", 0.5)
    cycle_val = sliders.get("cycle", 0.5)
    volatility = sliders.get("volatility", 0.5)

    # Combined degradation factor (0 to 1)
    # Higher means more degraded (closer to failure)
    deg_factor = (wear * 0.4) + (severity * 0.2) + (thermal * 0.2) + (cycle_val * 0.2)
    
    # Sensors that INCREASE with degradation in C-MAPSS
    inc_sensors = [2, 3, 4, 8, 11, 13, 15, 17]
    # Sensors that DECREASE with degradation
    dec_sensors = [1, 7, 12, 20, 21]

    seq = np.zeros((SEQ_LENGTH, NUM_FEATURES))
    
    for i, name in enumerate(FEATURE_NAMES):
        # Extract base sensor name (e.g. sensor_11 from sensor_11_rollmean_10)
        base_name = "_".join(name.split('_')[:2])
        base_mean = MEANS.get(base_name, 0.0)
        base_scale = SCALES.get(base_name, 1.0)
        
        # Determine if this sensor is sensitive to degradation
        s_num = int(base_name.split('_')[1]) if 'sensor' in base_name else -1
        
        # Calculate trend
        trend = 0.0
        if s_num in inc_sensors:
            trend = 1.0
        elif s_num in dec_sensors:
            trend = -1.0
            
        # Fill 30 cycles with a temporal progression
        for t in range(SEQ_LENGTH):
            # Lifecycle progression (t goes from -30 to 0 relative to "now")
            # We want to show a slight increase in degradation over these 30 steps
            time_deg = (t / SEQ_LENGTH) * 0.05 
            current_deg = deg_factor + time_deg
            
            # Value = Mean + (Trend * Degradation * Scale * Multiplier) + Noise
            noise = np.random.randn() * volatility * base_scale * 0.1
            val = base_mean + (trend * current_deg * base_scale * 2.0) + noise
            
            # Special handling for rolling features (simplified to match raw for now)
            if 'rollstd' in name:
                val = base_scale * (volatility + current_deg) * 0.2
            
            seq[t, i] = val

    # Scale the entire sequence using the domain-specific scaler
    scaler = SCALERS.get(domain, SCALERS.get(DEFAULT_DOMAIN))
    seq_flat = seq.reshape(-1, NUM_FEATURES)
    seq_scaled = scaler.transform(seq_flat)
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
        current_model = load_lstm_model()
        if current_model:
            # Using MC_SAMPLES = 3 for performance
            for _ in range(MC_SAMPLES):
                # training=True enables Dropout at inference time
                pred = current_model(sequence, training=True).numpy()[0][0]
                preds.append(pred)
        else:
            # Mock prediction based on sliders for testing
            wear = data.get("wear", 0.5)
            mock_base = 100 - (wear * 80)
            preds = [mock_base + np.random.randn() * 5 for _ in range(MC_SAMPLES)]
        
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
# SERVE FRONTEND (REACT APP) - Catch-all must be last
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
# RUN
# ---------------------------
if __name__ == "__main__":
    app.run(debug=True)