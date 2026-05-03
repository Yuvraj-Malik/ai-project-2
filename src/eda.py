import pandas as pd

# Load dataset
file_path = "data/raw/train_FD001.txt"

df = pd.read_csv(file_path, sep=" ", header=None)

print("Shape:", df.shape)

print("\nFirst 5 rows:")
print(df.head())

print("\nMissing values per column:")
print(df.isnull().sum())

print("\nUnique values per column:")
print(df.nunique())