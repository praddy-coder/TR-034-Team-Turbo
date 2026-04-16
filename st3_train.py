import torch
from torch_geometric.data import Data, DataLoader
from rdkit import Chem
import pandas as pd
from tdc.single_pred import Tox
from st2_model import TurboGNN

# 1. Helper function: Turn SMILES into a Graph 
def smiles_to_graph(smiles, y_val):
    mol = Chem.MolFromSmiles(smiles)
    if not mol: return None
    # Get atom features (just atomic numbers for now)
    xs = [[atom.GetAtomicNum()] * 9 for atom in mol.GetAtoms()] 
    x = torch.tensor(xs, dtype=torch.float)
    # Get bond connections
    edge_indices = []
    for bond in mol.GetBonds():
        edge_indices.append([bond.GetBeginAtomIdx(), bond.GetEndAtomIdx()])
    edge_index = torch.tensor(edge_indices, dtype=torch.long).t().contiguous()
    return Data(x=x, edge_index=edge_index, y=torch.tensor([[y_val]], dtype=torch.float))

# 2. Load and Convert Data [cite: 17]
print("Preparing dataset for Team Turbo...")
data_loader = Tox(name = 'LD50_Zhu')
df = data_loader.get_split()['train']
molecule_graphs = [smiles_to_graph(s, y) for s, y in zip(df['Drug'], df['Y']) if smiles_to_graph(s, y)]
loader = DataLoader(molecule_graphs, batch_size=32, shuffle=True)

# 3. Setup Training 
model = TurboGNN(hidden_channels=64).to('cuda')
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
criterion = torch.nn.MSELoss()

# 4. The Training Loop
print("Starting Training on GPU...")
model.train()
for epoch in range(1, 11): # 10 rounds of learning
    total_loss = 0
    for data in loader:
        data = data.to('cuda')
        optimizer.zero_grad()
        out = model(data.x, data.edge_index, data.batch)
        loss = criterion(out, data.y)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    print(f"Epoch {epoch} | Loss: {total_loss/len(loader):.4f}")

print("\nTraining Complete! Model is now 'Chemical-Smart'.")