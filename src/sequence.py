import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

# ---------------------------
# CONFIG
# ---------------------------
DATA_PATH = "data/processed/train_processed.csv"
SEQ_LENGTH = 30

# ---------------------------
# LOAD DATA
# ---------------------------
def load_data():
    return pd.read_csv(DATA_PATH)

# ---------------------------
# CREATE SEQUENCES
# ---------------------------
def create_sequences(df, seq_length):
    features = df.columns.difference(['dataset_id', 'engine_id', 'cycle', 'RUL'])

    X, y = [], []

    # Group by both dataset and engine to prevent sequences crossing domain boundaries
    for (dataset_id, engine_id), group_df in df.groupby(['dataset_id', 'engine_id']):
        if len(group_df) < seq_length:
            continue
            
        for i in range(len(group_df) - seq_length):
            X.append(group_df[features].iloc[i:i+seq_length].values)
            y.append(group_df['RUL'].iloc[i+seq_length])

    return np.array(X), np.array(y)

# ---------------------------
# STRATIFIED ENGINE-WISE SPLIT
# ---------------------------
def split_by_engine(df):
    train_dfs = []
    val_dfs = []
    
    # Split engines within each dataset to ensure all domains are represented in train/val
    for dataset_id, group_df in df.groupby('dataset_id'):
        engine_ids = group_df['engine_id'].unique()
        # Ensure we have enough engines to split
        if len(engine_ids) > 1:
            train_ids, val_ids = train_test_split(engine_ids, test_size=0.2, random_state=42)
        else:
            train_ids, val_ids = engine_ids, []
            
        train_dfs.append(group_df[group_df['engine_id'].isin(train_ids)])
        if len(val_ids) > 0:
            val_dfs.append(group_df[group_df['engine_id'].isin(val_ids)])

    train_df = pd.concat(train_dfs) if train_dfs else pd.DataFrame()
    val_df = pd.concat(val_dfs) if val_dfs else pd.DataFrame()

    return train_df, val_df

# ---------------------------
# MAIN PIPELINE
# ---------------------------
def main():
    df = load_data()

    # Split data
    train_df, val_df = split_by_engine(df)

    print(f"Train engines: {train_df.groupby(['dataset_id', 'engine_id']).ngroups if not train_df.empty else 0}")
    print(f"Validation engines: {val_df.groupby(['dataset_id', 'engine_id']).ngroups if not val_df.empty else 0}")

    # Create sequences
    X_train, y_train = create_sequences(train_df, SEQ_LENGTH)
    X_val, y_val = create_sequences(val_df, SEQ_LENGTH)

    print("X_train shape:", X_train.shape)
    print("y_train shape:", y_train.shape)

    print("X_val shape:", X_val.shape)
    print("y_val shape:", y_val.shape)

    # Save
    np.save("data/processed/X_train.npy", X_train)
    np.save("data/processed/y_train.npy", y_train)
    np.save("data/processed/X_val.npy", X_val)
    np.save("data/processed/y_val.npy", y_val)

    print("Sequences saved successfully!")

# ---------------------------
if __name__ == "__main__":
    main()