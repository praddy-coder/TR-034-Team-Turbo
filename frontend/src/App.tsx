import { useState, useRef } from 'react';
import { 
  Activity, 
  Database, 
  FlaskConical, 
  LayoutDashboard, 
  Settings, 
  Microscope,
  Upload,
  Search,
  Filter,
  CheckCircle,
  X
} from 'lucide-react';

// --- Mock Data ---
const initialCandidates = [
  { id: '1', smiles: 'CC(=O)Oc1ccccc1C(=O)O', name: 'Aspirin', toxicity: 0.12, solubility: 0.88, drugLikeness: 0.92, status: 'safe' },
  { id: '2', smiles: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C', name: 'Caffeine', toxicity: 0.34, solubility: 0.76, drugLikeness: 0.85, status: 'warning' },
  { id: '3', smiles: 'c1ccccc1', name: 'Benzene', toxicity: 0.95, solubility: 0.23, drugLikeness: 0.15, status: 'danger' },
  { id: '4', smiles: 'CCO', name: 'Ethanol', toxicity: 0.55, solubility: 0.99, drugLikeness: 0.65, status: 'warning' },
  { id: '5', smiles: 'CC12CCC3C(C1CCC2O)CCC4=CC(=O)CCC34C', name: 'Testosterone', toxicity: 0.28, solubility: 0.45, drugLikeness: 0.89, status: 'safe' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [candidates, setCandidates] = useState(initialCandidates);
  const [selectedHeatmap, setSelectedHeatmap] = useState<any | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const lines = text.split('\n').filter(line => line.trim().length > 0);
          
          const newCandidates = lines.slice(1).map((line, index) => {
            const [id, smiles, name] = line.split(',');
            const toxicity = Math.random();
            const solubility = Math.random();
            const drugLikeness = Math.random();
            const status = toxicity > 0.8 ? 'danger' : toxicity > 0.4 ? 'warning' : 'safe';
            
            return {
              id: id?.trim() || `new-${index}`,
              smiles: smiles?.trim() || '',
              name: name?.trim() || 'Unknown',
              toxicity,
              solubility,
              drugLikeness,
              status
            };
          });
          
          setCandidates(newCandidates);
          setUploadStatus(`Processed ${newCandidates.length} molecules from ${file.name}`);
          setTimeout(() => setUploadStatus(null), 3000);
          setActiveTab('screening'); // Auto-switch to see results
        }
      };
      reader.readAsText(file);
    }
    // Reset the input so the same file could be uploaded again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <FlaskConical color="white" size={24} />
          </div>
          <div>
            <h2 className="text-gradient" style={{ margin: 0 }}>TENSOR '26</h2>
            <p style={{ fontSize: '0.75rem', margin: 0 }}>Team Turbo</p>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          <a className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} />
            Overview
          </a>
          <a className={`nav-item ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')}>
            <Database size={20} />
            Molecule Library
          </a>
          <a className={`nav-item ${activeTab === 'screening' ? 'active' : ''}`} onClick={() => setActiveTab('screening')}>
            <Microscope size={20} />
            ADMET Screening
          </a>
          <a className={`nav-item ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}>
            <Activity size={20} />
            Training Jobs
          </a>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <a className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={20} />
            Settings
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header section (contextual based on active tab) */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 className="animate-fade-in text-gradient-secondary">
              {activeTab === 'dashboard' ? 'ADMET Intelligence Platform' : 
               activeTab === 'library' ? 'Candidate Library' : 
               activeTab === 'screening' ? 'Screening Dashboard' : 'Training Activity'}
            </h1>
            <p className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Graph Neural Network-Based Molecule Property Predictor
            </p>
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.2s', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {uploadStatus && (
              <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }} className="animate-fade-in">
                <CheckCircle size={16} />
                {uploadStatus}
              </span>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".csv,.txt"
              onChange={handleFileChange}
            />
            <button className="btn btn-primary" onClick={handleUploadClick}>
              <Upload size={18} />
              Upload SMILES Batch
            </button>
          </div>
        </header>

        {/* Dynamic View */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="dashboard-grid">
              <div className="glass-panel stat-card">
                <span className="stat-label">Molecules Evaluated</span>
                <span className="stat-value text-gradient">10,482</span>
                <span style={{ fontSize: '0.75rem', color: '#10b981' }}>+12% this week</span>
              </div>
              <div className="glass-panel stat-card">
                <span className="stat-label">Model Accuracy (TDC)</span>
                <span className="stat-value text-gradient-secondary">94.2%</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AUC-ROC</span>
              </div>
              <div className="glass-panel stat-card">
                <span className="stat-label">Highest Drug-Likeness</span>
                <span className="stat-value" style={{ color: 'var(--accent-3)' }}>0.98</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Molecule ID: CAN-893</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
              <div className="glass-panel">
                <h3>Recent Screening Activity</h3>
                <p style={{ marginBottom: '1rem' }}>Latest batch predictions processed via GNN Model.</p>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Molecule</th>
                        <th>Toxicity</th>
                        <th>Solubility</th>
                        <th>Drug-Likeness</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidates.slice(0, 3).map(c => (
                        <tr key={c.id}>
                          <td>{c.name}</td>
                          <td>{(c.toxicity * 100).toFixed(1)}%</td>
                          <td>{(c.solubility * 100).toFixed(1)}%</td>
                          <td>{c.drugLikeness.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="glass-panel">
                <h3>Substructure Attribution</h3>
                <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Heatmap visualization for toxicity prediction drivers.</p>
                <div style={{ 
                  height: '200px', 
                  borderRadius: '12px',
                  background: 'radial-gradient(circle at center, rgba(239, 68, 68, 0.2), #141417)',
                  border: '1px solid var(--panel-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <span className="badge badge-danger">High Confidence</span>
                  </div>
                  {/* Mock molecule image representation */}
                  <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                    <path d="M12 2L22 7.5L22 18.5L12 24L2 18.5L2 7.5L12 2Z"/>
                    <path d="M12 22V13"/>
                    <path d="M22 7.5L12 13L2 7.5"/>
                    <circle cx="12" cy="13" r="3" fill="rgba(239, 68, 68, 0.5)" stroke="none" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Screening View */}
        {activeTab === 'screening' && (
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="glass-panel" style={{ padding: '0' }}>
              <div style={{ padding: '1.5rem', display: 'flex', gap: '1rem', borderBottom: '1px solid var(--panel-border)' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="input-control" 
                    placeholder="Search SMILES or Identity..." 
                    style={{ paddingLeft: '2.5rem' }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button className="btn btn-secondary">
                  <Filter size={18} /> Filters
                </button>
                <button className="btn btn-secondary">
                  Export CSV
                </button>
              </div>
              
              <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>SMILES String</th>
                      <th>Common Name</th>
                      <th>Toxicity Risk</th>
                      <th>Solubility (LogS)</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.smiles.toLowerCase().includes(search.toLowerCase())).map(c => (
                      <tr key={c.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--accent-3)' }}>{c.smiles}</td>
                        <td style={{ fontWeight: 500 }}>{c.name}</td>
                        <td>{(c.toxicity * 100).toFixed(1)}%</td>
                        <td>{(c.solubility * 100).toFixed(1)}%</td>
                        <td>
                          <span className={`badge badge-${c.status}`}>
                            {c.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <button 
                            style={{ 
                              background: 'transparent', 
                              border: '1px solid var(--accent-1)', 
                              color: 'var(--accent-1)',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}
                            onClick={() => setSelectedHeatmap(c)}
                          >
                            View Heatmap
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Molecule Library View */}
        {activeTab === 'library' && (
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="dashboard-grid">
              {candidates.map((c, idx) => (
                <div key={`${c.id}-${idx}`} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '1.125rem' }}>{c.name}</span>
                    <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)' }}>{c.id}</span>
                  </div>
                  <div style={{ padding: '0.75rem', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px', wordBreak: 'break-all' }}>
                    <code style={{ fontSize: '0.8rem', color: 'var(--accent-3)' }}>{c.smiles}</code>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Source: TDC Database</span>
                    <span style={{ color: 'var(--accent-1)', cursor: 'pointer' }}>Edit Data</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Training Jobs View */}
        {activeTab === 'jobs' && (
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>Active GNN Training Queue</h3>
                <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                  <Activity size={16} /> New Job
                </button>
              </div>
              
              <div className="table-container" style={{ border: 'none' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Job ID</th>
                      <th>Model Architecture</th>
                      <th>Target Property</th>
                      <th>Status</th>
                      <th>Progress / Epoch</th>
                      <th>Metrics</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code style={{ color: 'var(--accent-1)' }}>JOB-88A2</code></td>
                      <td>TurboGNN (Hidden: 64)</td>
                      <td>Composite ADMET</td>
                      <td><span className="badge badge-warning">Running</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px' }}>
                            <div style={{ width: '45%', background: 'var(--accent-1)', height: '100%', borderRadius: '3px' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem' }}>45/100</span>
                        </div>
                      </td>
                      <td>Loss: 0.0412</td>
                    </tr>
                    <tr>
                      <td><code style={{ color: 'var(--accent-1)' }}>JOB-88A1</code></td>
                      <td>GAT v2 (Multi-head)</td>
                      <td>Toxicity (ClinTox)</td>
                      <td><span className="badge badge-success">Completed</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px' }}>
                            <div style={{ width: '100%', background: '#10b981', height: '100%', borderRadius: '3px' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem' }}>100/100</span>
                        </div>
                      </td>
                      <td>AUC: 0.942</td>
                    </tr>
                    <tr>
                      <td><code style={{ color: 'var(--accent-1)' }}>JOB-88A0</code></td>
                      <td>TurboGNN (Base)</td>
                      <td>Solubility (ESOL)</td>
                      <td><span className="badge badge-success">Completed</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px' }}>
                            <div style={{ width: '100%', background: '#10b981', height: '100%', borderRadius: '3px' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem' }}>50/50</span>
                        </div>
                      </td>
                      <td>RMSE: 0.682</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-panel">
              <h3>System Resource Utilization</h3>
              <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>GPU Acceleration via PyTorch Geometric</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>GPU Load (CUDA:0)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--accent-2)' }}>78%</div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>VRAM Usage</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--accent-3)' }}>12.4 / 16 GB</div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Batch Throughput</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--accent-1)' }}>1,240 / sec</div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Settings View */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.75rem' }}>Model Configuration</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Active Architecture</label>
                  <select className="input-control" style={{ background: 'rgba(0,0,0,0.3)', cursor: 'pointer' }}>
                    <option>TurboGNN v2.1 (Production)</option>
                    <option>Graph Attention Network (GAT)</option>
                    <option>Graph Convolutional Network (GCN)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Hidden Channels</label>
                  <select className="input-control" style={{ background: 'rgba(0,0,0,0.3)', cursor: 'pointer' }}>
                    <option>64 (Default)</option>
                    <option>128 (High Precision)</option>
                    <option>32 (Fast Inference)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.75rem' }}>Screening Thresholds</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Toxicity Risk Threshold</label>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>0.40</span>
                  </div>
                  <input type="range" min="0" max="100" defaultValue="40" style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-1)' }} />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Molecules exceeding this threshold will be flagged as warning or danger.</p>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Minimum Drug-Likeness (QED)</label>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>0.65</span>
                  </div>
                  <input type="range" min="0" max="100" defaultValue="65" style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-2)' }} />
                </div>
              </div>
            </div>

            <div className="glass-panel">
              <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.75rem' }}>Hardware & Execution</h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>CUDA Acceleration</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Utilize PyTorch GPU backend for inference</div>
                </div>
                <div style={{ width: '44px', height: '24px', background: 'var(--accent-1)', borderRadius: '12px', padding: '2px', cursor: 'pointer' }}>
                  <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', transform: 'translateX(20px)', transition: 'transform 0.2s' }}></div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>Auto-Export Screenings</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Automatically generate CSV+PDF reports after batch processing</div>
                </div>
                <div style={{ width: '44px', height: '24px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', padding: '2px', cursor: 'pointer' }}>
                  <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: 'transform 0.2s' }}></div>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-secondary">Discard Changes</button>
              <button className="btn btn-primary" onClick={() => setActiveTab('dashboard')}>Save Configuration</button>
            </div>
          </div>
        )}
      </main>

      {/* Heatmap Modal */}
      {selectedHeatmap && (
        <div className="modal-overlay" onClick={() => setSelectedHeatmap(null)}>
          <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedHeatmap(null)}>
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '0.5rem' }}>Substructure Attribution Heatmap</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Explainability analysis for <strong>{selectedHeatmap.name}</strong> 
              <br/><code style={{ fontSize: '0.875rem', color: 'var(--accent-3)' }}>{selectedHeatmap.smiles}</code>
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div style={{ 
                height: '250px', 
                borderRadius: '16px',
                background: selectedHeatmap.toxicity > 0.8 
                  ? 'radial-gradient(circle at center, rgba(239, 68, 68, 0.25), #141417)'
                  : selectedHeatmap.toxicity > 0.4
                    ? 'radial-gradient(circle at center, rgba(245, 158, 11, 0.25), #141417)'
                    : 'radial-gradient(circle at center, rgba(16, 185, 129, 0.25), #141417)',
                border: '1px solid var(--panel-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
                  <span className={`badge badge-${selectedHeatmap.status}`}>
                    {selectedHeatmap.status.toUpperCase()} TOXICITY
                  </span>
                </div>
                {/* SVG Mock of a highlighted molecule */}
                <svg width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L22 7.5L22 18.5L12 24L2 18.5L2 7.5L12 2Z"/>
                  <path d="M12 22V13"/>
                  <path d="M22 7.5L12 13L2 7.5"/>
                  {selectedHeatmap.toxicity > 0.4 && (
                    <circle cx="12" cy="13" r="4" fill={selectedHeatmap.toxicity > 0.8 ? "rgba(239, 68, 68, 0.6)" : "rgba(245, 158, 11, 0.6)"} stroke="none" />
                  )}
                  {selectedHeatmap.solubility < 0.4 && (
                    <circle cx="2" cy="7.5" r="3" fill="rgba(99, 102, 241, 0.6)" stroke="none" />
                  )}
                </svg>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Primary Driver</div>
                  <div style={{ fontWeight: 600 }}>Toxicity Score: {(selectedHeatmap.toxicity * 100).toFixed(1)}%</div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Secondary Factor</div>
                  <div style={{ fontWeight: 600 }}>Solubility (LogS): {(selectedHeatmap.solubility * 100).toFixed(1)}%</div>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  The highlighted region indicates the substructure most heavily weighted by the GNN model during prediction.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
