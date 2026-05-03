import pandas as pd
import numpy as np
import pickle
import os
from tensorflow.keras.models import load_model

# ---------------------------
# CONFIG
# ---------------------------
RAW_DIR = "raw"
SCALER_PATH = "models/scaler.pkl"
SEQ_LENGTH = 30
MC_SAMPLES = 20  # Number of Monte Carlo samples for uncertainty estimation

# ---------------------------
# LOAD TEST DATA
# ---------------------------
def load_test_datasets(directory):
    dfs = []
    for i in range(1, 5):
        filename = f"test_FD00{i}.txt"
        path = os.path.join(directory, filename)
        if not os.path.exists(path):
            continue
            
        df = pd.read_csv(path, sep=r"\s+", header=None)
        if 26 in df.columns: df = df.drop(columns=[26])
        if 27 in df.columns: df = df.drop(columns=[27])
        
        cols = ['engine_id', 'cycle'] + \
               [f'op_setting_{j}' for j in range(1,4)] + \
               [f'sensor_{j}' for j in range(1,22)]
        df.columns = cols
        df['dataset_id'] = f'FD00{i}'
        dfs.append(df)
        
    return pd.concat(dfs, ignore_index=True)

test = load_test_datasets(RAW_DIR)

# Scalers will be loaded per dataset below

def add_rolling_features(df):
    sensor_cols = [col for col in df.columns if 'sensor' in col]
    window_sizes = [5, 10]
    grouped = df.groupby(['dataset_id', 'engine_id'])
    for w in window_sizes:
        for col in sensor_cols:
            df[f'{col}_rollmean_{w}'] = grouped[col].transform(lambda x: x.rolling(w, min_periods=1).mean())
            df[f'{col}_rollstd_{w}'] = grouped[col].transform(lambda x: x.rolling(w, min_periods=1).std().fillna(0))
    return df

print("Adding rolling features to test set...")
test = add_rolling_features(test)

# Scale the features per dataset
print("Scaling test features...")
features = test.columns.difference(['dataset_id', 'engine_id', 'cycle', 'RUL'])

for dataset_id, group in test.groupby('dataset_id'):
    scaler_path = f"models/scaler_{dataset_id}.pkl"
    if not os.path.exists(scaler_path):
        print(f"Warning: {scaler_path} not found.")
        continue
        
    with open(scaler_path, "rb") as f:
        scaler = pickle.load(f)
        
    # Scale only the rows for this dataset
    test.loc[test['dataset_id'] == dataset_id, features] = scaler.transform(group[features])

# ---------------------------
# CREATE LAST SEQUENCES
# ---------------------------
X_test = []
engine_metadata = []

for (dataset_id, engine_id), group_df in test.groupby(['dataset_id', 'engine_id']):
    if len(group_df) < SEQ_LENGTH:
        continue
        
    last_sequence = group_df[features].iloc[-SEQ_LENGTH:].values
    X_test.append(last_sequence)
    engine_metadata.append((dataset_id, engine_id))

X_test = np.array(X_test)
print("X_test shape:", X_test.shape)

# ---------------------------
# LOAD MODEL
# ---------------------------
model = load_model("models/lstm_model.h5", compile=False)

# ---------------------------
# PREDICT WITH MONTE CARLO DROPOUT
# ---------------------------
print(f"Running {MC_SAMPLES} Monte Carlo passes for uncertainty estimation...")
predictions_mc = []
for i in range(MC_SAMPLES):
    preds = model(X_test, training=True) # training=True forces Dropout
    predictions_mc.append(preds.numpy())

predictions_mc = np.array(predictions_mc) # shape: (MC_SAMPLES, N_engines, 1)

mean_preds = np.mean(predictions_mc, axis=0).flatten()
std_preds = np.std(predictions_mc, axis=0).flatten()

# Print first 10
print("\nPredicted RUL for first 10 test engines:")
for i in range(10):
    ds, eng = engine_metadata[i]
    print(f"Dataset: {ds}, Engine: {eng} | Mean RUL: {mean_preds[i]:.2f} | Uncertainty (Std): {std_preds[i]:.2f}")