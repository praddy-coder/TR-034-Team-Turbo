import torch
from torch.nn import Linear
import torch.nn.functional as F
from torch_geometric.nn import GCNConv, global_mean_pool

class TurboGNN(torch.nn.Module):
    def __init__(self, hidden_channels):
        super(TurboGNN, self).__init__()
        torch.manual_seed(12345)
        # GNN Layers: These analyze the "neighborhood" of each atom
        self.conv1 = GCNConv(9, hidden_channels) # 9 features per atom
        self.conv2 = GCNConv(hidden_channels, hidden_channels)
        self.conv3 = GCNConv(hidden_channels, hidden_channels)
        # Final output layer to predict the ADMET value [cite: 27]
        self.lin = Linear(hidden_channels, 1)

    def forward(self, x, edge_index, batch):
        # 1. Look at atoms and their connections
        x = self.conv1(x, edge_index).relu()
        x = self.conv2(x, edge_index).relu()
        x = self.conv3(x, edge_index)
        # 2. Pool the information to get a single "fingerprint" of the molecule
        x = global_mean_pool(x, batch) 
        # 3. Predict the final value [cite: 27]
        return self.lin(x)

model = TurboGNN(hidden_channels=64).to('cuda') # Use that GPU!
print(model)
print("\nTeam Turbo Model is built and loaded on GPU!")