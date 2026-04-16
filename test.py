import torch
import torch_geometric
from rdkit import Chem

# Direct import from the exact folder path
try:
    from tdc.single_pred.admet import ADMET
    print("TDC ADMET Library: Found!")
except ImportError:
    try:
        from tdc.single_pred import ADMET
        print("TDC ADMET Library: Found in single_pred!")
    except ImportError as e:
        print(f"Still having trouble finding ADMET: {e}")

print(f"GPU Available: {torch.cuda.is_available()}")
print(f"GNN Library Ready: {torch_geometric.__version__}")
print(f"RDKit Ready: {Chem.MolToSmiles(Chem.MolFromSmiles('C'))}")

print("All systems go for Team Turbo!")