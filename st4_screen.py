import torch
from rdkit import Chem
import pandas as pd
from st2_model import TurboGNN
from torch_geometric.data import Data, Batch

# 1. Load the "Smart" Model
model = TurboGNN(hidden_channels=64).to('cuda')
model.eval() # Set to evaluation mode

# 2. Simple Function to prepare a molecule for the GPU
def prepare_mol(smiles):
    mol = Chem.MolFromSmiles(smiles)
    if not mol: return None
    xs = [[atom.GetAtomicNum()] * 9 for atom in mol.GetAtoms()] 
    x = torch.tensor(xs, dtype=torch.float)
    edge_indices = [[b.GetBeginAtomIdx(), b.GetEndAtomIdx()] for b in mol.GetBonds()]
    edge_index = torch.tensor(edge_indices, dtype=torch.long).t().contiguous()
    return Data(x=x, edge_index=edge_index)

# 3. Simulate a library of 10,000 molecules (as per PS86 requirement) [cite: 18, 33]
print("Generating screening results for candidate library...")
# For now, we'll use a few samples, but you can load your 10k CSV here!
candidates = ["CCO", "c1ccccc1", "CC(=O)Oc1ccccc1C(=O)O", "CN1C=NC2=C1C(=O)N(C(=O)N2C)C"] # Alcohol, Benzene, Aspirin, Caffeine
results = []

for smiles in candidates:
    data = prepare_mol(smiles)
    if data:
        data = data.to('cuda')
        with torch.no_grad():
            prediction = model(data.x, data.edge_index, torch.zeros(data.x.size(0), dtype=torch.long, device='cuda'))
            results.append({"SMILES": smiles, "Toxicity_Score": round(prediction.item(), 4)})

# 4. Rank and Export [cite: 29, 30]
df_results = pd.DataFrame(results).sort_values(by="Toxicity_Score")
df_results.to_csv("Team_Turbo_Screening_Report.csv", index=False)

print("\n--- SCREENING COMPLETE ---")
print(df_results)
print("\nReport exported to: Team_Turbo_Screening_Report.csv")