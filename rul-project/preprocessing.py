import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import os

data_path = "CMaps"

datasets = ["FD001", "FD002", "FD003", "FD004"]

all_train = []
all_test = []

for ds in datasets:
    print(f"Processing {ds}...")

    train_file = os.path.join(data_path, f"train_{ds}.txt")
    test_file = os.path.join(data_path, f"test_{ds}.txt")

    train = pd.read_csv(train_file, sep=" ", header=None).dropna(axis=1)
    test = pd.read_csv(test_file, sep=" ", header=None).dropna(axis=1)

    columns = ['unit_id', 'cycle'] + \
              [f'setting_{i}' for i in range(1, 4)] + \
              [f'sensor_{i}' for i in range(1, 22)]

    train.columns = columns
    test.columns = columns

    # Create RUL
    max_cycle = train.groupby('unit_id')['cycle'].max().reset_index()
    max_cycle.columns = ['unit_id', 'max_cycle']

    train = train.merge(max_cycle, on='unit_id')
    train['RUL'] = train['max_cycle'] - train['cycle']
    train.drop(columns=['max_cycle'], inplace=True)

    # Clip RUL
    train['RUL'] = train['RUL'].clip(upper=125)

    # Remove low variance sensors
    sensor_cols = [col for col in train.columns if 'sensor' in col]
    low_variance = train[sensor_cols].std() < 0.01
    drop_sensors = low_variance[low_variance].index.tolist()

    train.drop(columns=drop_sensors, inplace=True)
    test.drop(columns=drop_sensors, inplace=True)

    # Normalize
    scaler = MinMaxScaler()
    feature_cols = train.columns.difference(['unit_id', 'cycle', 'RUL'])

    train[feature_cols] = scaler.fit_transform(train[feature_cols])
    test[feature_cols] = scaler.transform(test[feature_cols])

    # Add dataset label
    train["dataset"] = ds
    test["dataset"] = ds

    all_train.append(train)
    all_test.append(test)

# Combine all datasets
final_train = pd.concat(all_train, ignore_index=True)
final_test = pd.concat(all_test, ignore_index=True)

# Save output
final_train.to_csv("processed_train_all.csv", index=False)
final_test.to_csv("processed_test_all.csv", index=False)

print("✅ ALL DATASETS PROCESSED SUCCESSFULLY!")