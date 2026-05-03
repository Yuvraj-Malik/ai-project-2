import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import pickle
import os

# ---------------------------
# CONFIG
# ---------------------------
RAW_DIR = "raw"
SAVE_PATH = "data/processed/train_processed.csv"
SCALER_PATH = "models/scaler.pkl"

# ---------------------------
# LOAD DATA
# ---------------------------
def load_all_datasets(directory):
    dfs = []
    for i in range(1, 5):
        filename = f"train_FD00{i}.txt"
        path = os.path.join(directory, filename)
        if not os.path.exists(path):
            print(f"Warning: {path} not found.")
            continue
            
        df = pd.read_csv(path, sep=r"\s+", header=None)
        # Drop empty columns
        if 26 in df.columns: df = df.drop(columns=[26])
        if 27 in df.columns: df = df.drop(columns=[27])
        
        # Assign column names
        cols = ['engine_id', 'cycle'] + \
               [f'op_setting_{j}' for j in range(1,4)] + \
               [f'sensor_{j}' for j in range(1,22)]
        df.columns = cols
        
        # Add dataset_id for domain adaptation / grouping
        df['dataset_id'] = f'FD00{i}'
        dfs.append(df)
        
    return pd.concat(dfs, ignore_index=True)

# ---------------------------
# REMOVE CONSTANT COLUMNS
# ---------------------------
def remove_constant_columns(df):
    nunique = df.nunique()
    constant_cols = nunique[nunique == 1].index

    print("Removing constant columns across all domains:", list(constant_cols))

    df = df.drop(columns=constant_cols)
    return df

# ---------------------------
# ADD DEGRADATION PATTERN FEATURES
# ---------------------------
def add_rolling_features(df):
    sensor_cols = [col for col in df.columns if 'sensor' in col]
    window_sizes = [5, 10]
    
    # We must group by both dataset_id and engine_id to not mix different engines/domains
    grouped = df.groupby(['dataset_id', 'engine_id'])
    
    for w in window_sizes:
        for col in sensor_cols:
            df[f'{col}_rollmean_{w}'] = grouped[col].transform(lambda x: x.rolling(w, min_periods=1).mean())
            df[f'{col}_rollstd_{w}'] = grouped[col].transform(lambda x: x.rolling(w, min_periods=1).std().fillna(0))
            
    return df

# ---------------------------
# CREATE RUL + CAP IT
# ---------------------------
def add_rul(df):
    # Group by dataset and engine
    max_cycle = df.groupby(['dataset_id', 'engine_id'])['cycle'].max().reset_index()
    max_cycle.rename(columns={'cycle': 'max_cycle'}, inplace=True)

    df = df.merge(max_cycle, on=['dataset_id', 'engine_id'])

    # Compute RUL
    df['RUL'] = df['max_cycle'] - df['cycle']

    # CAP RUL (VERY IMPORTANT FIX)
    df['RUL'] = df['RUL'].clip(upper=125)

    df = df.drop(columns=['max_cycle'])
    return df

# ---------------------------
# SCALE FEATURES
# ---------------------------
def scale_data(df):
    features = df.columns.difference(['dataset_id', 'engine_id', 'cycle', 'RUL'])
    
    os.makedirs("models", exist_ok=True)
    
    for dataset_id, group in df.groupby('dataset_id'):
        scaler = StandardScaler()
        # Scale only the rows for this dataset
        df.loc[df['dataset_id'] == dataset_id, features] = scaler.fit_transform(group[features])
        
        # Save domain-specific scaler
        scaler_path = f"models/scaler_{dataset_id}.pkl"
        with open(scaler_path, "wb") as f:
            pickle.dump(scaler, f)

    return df

# ---------------------------
# MAIN PIPELINE
# ---------------------------
def preprocess():
    df = load_all_datasets(RAW_DIR)

    print("Original shape:", df.shape)

    df = remove_constant_columns(df)
    print("Adding rolling features for degradation pattern learning...")
    df = add_rolling_features(df)
    df = add_rul(df)
    print("Scaling data...")
    df = scale_data(df)

    print("Processed shape:", df.shape)

    os.makedirs(os.path.dirname(SAVE_PATH), exist_ok=True)
    df.to_csv(SAVE_PATH, index=False)
    print("Saved processed data to:", SAVE_PATH)

# ---------------------------
# RUN
# ---------------------------
if __name__ == "__main__":
    preprocess()