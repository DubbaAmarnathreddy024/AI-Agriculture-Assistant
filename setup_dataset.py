import zipfile
import os
import pandas as pd

print("📦 Extracting dataset...")

ZIP_PATH = "archive.zip"
DATA_DIR = "data"

os.makedirs(DATA_DIR, exist_ok=True)

with zipfile.ZipFile(ZIP_PATH, 'r') as zip_ref:
    zip_ref.extractall(DATA_DIR)

print("✅ Dataset extracted")

csv_path = os.path.join(DATA_DIR, "Crop_recommendation.csv")

df = pd.read_csv(csv_path)

print("Dataset shape:", df.shape)
print(df.head())

# save cleaned version
df.to_csv("data/crop_dataset_clean.csv", index=False)

print("✅ Dataset ready")