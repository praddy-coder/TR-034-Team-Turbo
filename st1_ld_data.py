from tdc.single_pred import Tox
import pandas as pd

# 1. Load the 'Toxicity' dataset (LD50) - A core ADMET endpoint 
print("Downloading Toxicity (LD50) benchmark dataset...")
data = Tox(name = 'LD50_Zhu')

# 2. Split it into Train/Test [cite: 34]
split = data.get_split()
train_df = split['train']

print(f"\nSuccessfully loaded {len(train_df)} molecules!")
print(f"Top SMILES: {train_df['Drug'].iloc[0]}")
print(f"Toxicity Value: {train_df['Y'].iloc[0]}")