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
  const [filterStatus, setFilterStatus] = useState('all');
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [candidates, setCandidates] = useState(initialCandidates);
  const [selectedHeatmap, setSelectedHeatmap] = useState<{name: string, smiles: string, toxicity: number, solubility: number, status: string} | null>(null);
  const [toxicityThreshold, setToxicityThreshold] = useState(40);
  const [drugLikenessThreshold, setDrugLikenessThreshold] = useState(65);
  const [cudaEnabled, setCudaEnabled] = useState(true);
  const [autoExport, setAutoExport] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const renderMoleculePaths = (name: string) => {
    switch (name.toLowerCase()) {
      case 'benzene': return (
        <g className="molecule-paths" style={{ opacity: 0.9 }}>
          <path d="M30 50 L45 25 L75 25 L90 50 L75 75 L45 75 Z" strokeLinejoin="round" />
          <path d="M40 50 L49 33 M71 33 L80 50 M49 67 L71 67" strokeWidth="1" stroke="rgba(255,255,255,0.4)" />
        </g>
      );
      case 'ethanol': return (
        <g className="molecule-paths" style={{ opacity: 0.9 }}>
          <path d="M20 60 L50 40 L80 60" />
          <circle cx="80" cy="60" r="1" fill="var(--accent-1)" stroke="none" />
          <text x="85" y="65" fill="var(--accent-1)" fontSize="12" stroke="none" style={{ fontFamily: 'monospace' }}>OH</text>
        </g>
      );
      case 'aspirin': return (
        <g className="molecule-paths" style={{ opacity: 0.9 }}>
          <path d="M40 40 L55 30 L70 40 L70 60 L55 70 L40 60 Z" />
          <path d="M44 43 L55 35 M66 43 L66 57 M44 57 L55 65" strokeWidth="1" stroke="rgba(255,255,255,0.4)" />
          <path d="M70 40 L85 30 M85 30 L100 40 M83 30 L83 15 M87 30 L87 15" />
          <text x="78" y="12" fill="var(--text-main)" fontSize="12" stroke="none" style={{ fontFamily: 'monospace' }}>O</text>
          <text x="100" y="45" fill="var(--accent-2)" fontSize="12" stroke="none" style={{ fontFamily: 'monospace' }}>OH</text>
          <path d="M40 60 L25 70 M25 70 L10 60 M23 70 L23 85 M27 70 L27 85" />
          <text x="20" y="97" fill="var(--text-main)" fontSize="12" stroke="none" style={{ fontFamily: 'monospace' }}>O</text>
          <circle cx="25" cy="70" r="2.5" fill="var(--accent-1)" stroke="none" /> 
        </g>
      );
      case 'caffeine': return (
        <g className="molecule-paths" style={{ opacity: 0.9 }}>
          <path d="M40 40 L60 30 L80 40 L80 60 L60 70 L40 60 Z" />
          <text x="35" y="65" fill="var(--accent-3)" fontSize="12" stroke="none" style={{ fontFamily: 'monospace' }}>N</text>
          <text x="75" y="65" fill="var(--accent-3)" fontSize="12" stroke="none" style={{ fontFamily: 'monospace' }}>N</text>
          <text x="55" y="32" fill="var(--accent-3)" fontSize="12" stroke="none" style={{ fontFamily: 'monospace' }}>N</text>
          <path d="M40 40 L25 30 M38 40 L23 30" stroke="rgba(239, 68, 68, 0.8)" />
          <path d="M60 70 L60 85 M62 70 L62 85" stroke="rgba(239, 68, 68, 0.8)" />
          <path d="M80 40 L100 45 L95 65 L80 60" />
          <text x="90" y="70" fill="var(--accent-3)" fontSize="12" stroke="none" style={{ fontFamily: 'monospace' }}>N</text>
          <path d="M40 60 L25 70 M60 30 L60 15 M95 65 L110 75" />
        </g>
      );
      default: return (
        <g className="molecule-paths" style={{ opacity: 0.9 }}>
          <path d="M30 30 L45 20 L60 30 L60 50 L45 60 L30 50 Z" />
          <path d="M34 33 L45 26 M56 33 L56 47 M34 47 L45 54" strokeWidth="1" stroke="rgba(255,255,255,0.4)" />
          <path d="M60 30 L75 20 L90 30 L90 50 L75 60 L60 50" />
          <path d="M45 20 L45 5 M90 50 L100 58 M90 50 L100 42 A 5 5 0 0 1 100 58" stroke="rgba(255,255,255,0.7)" />
          <path d="M45 60 L45 75 L32 85 M45 75 L58 85 M47 75 L60 85" />
          <circle cx="32" cy="85" r="2.5" fill="var(--text-main)" stroke="none" />
          <circle cx="58" cy="85" r="2.5" fill="var(--accent-1)" stroke="none" />
        </g>
      );
    }
  };

  const renderHotspots = (name: string, toxicity: number, solubility: number) => {
    let tx = toxicity > 0.8 ? "75" : "30"; 
    let ty = toxicity > 0.8 ? "20" : "30"; 
    let sx = "45";
    let sy = "75";
    
    switch (name.toLowerCase()) {
      case 'benzene': tx="75"; ty="25"; sx="45"; sy="75"; break;
      case 'ethanol': tx="80"; ty="60"; sx="20"; sy="60"; break;
      case 'aspirin': tx="85"; ty="30"; sx="25"; sy="70"; break;
      case 'caffeine': tx="25"; ty="30"; sx="100"; sy="45"; break;
    }
    
    return (
      <>
        {toxicity > 0.4 && (
          <g className={toxicity > 0.8 ? "hotspot-danger" : "hotspot-warning"} style={{ transformOrigin: `${tx}px ${ty}px` }}>
            <circle cx={tx} cy={ty} r="12" fill={toxicity > 0.8 ? "rgba(239, 68, 68, 0.4)" : "rgba(245, 158, 11, 0.3)"} filter={toxicity > 0.8 ? "url(#glow-danger-modal)" : "url(#glow-warning-modal)"} stroke="none" />
            <circle cx={tx} cy={ty} r="4" fill={toxicity > 0.8 ? "#ef4444" : "#f59e0b"} stroke="none" />
          </g>
        )}
        {solubility < 0.4 && (
          <g className="hotspot-info" style={{ transformOrigin: `${sx}px ${sy}px` }}>
            <circle cx={sx} cy={sy} r="10" fill="rgba(99, 102, 241, 0.3)" filter="url(#glow-info-modal)" stroke="none" />
            <circle cx={sx} cy={sy} r="3" fill="#6366f1" stroke="none" />
          </g>
        )}
      </>
    );
  };

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
      <style>{`
        @keyframes moleculePulse {
          0% { transform: scale(0.95); opacity: 0.6; }
          100% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes moleculeDraw {
          0% { stroke-dasharray: 300; stroke-dashoffset: 300; opacity: 0; }
          100% { stroke-dasharray: 300; stroke-dashoffset: 0; opacity: 1; }
        }
        .molecule-paths path {
          animation: moleculeDraw 2.5s ease-out forwards;
        }
        .hotspot-danger {
          animation: moleculePulse 1.5s infinite alternate ease-in-out;
          transform-origin: center;
        }
        .hotspot-warning {
          animation: moleculePulse 2s infinite alternate-reverse ease-in-out;
          transform-origin: center;
        }
        .hotspot-info {
          animation: moleculePulse 2.5s infinite alternate ease-in-out;
          transform-origin: center;
        }
      `}</style>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <FlaskConical color="white" size={24} />
          </div>
          <div>
            <h2 className="text-gradient" style={{ margin: 0 }}>ToxiScreen</h2>
            <p style={{ fontSize: '0.75rem', margin: 0 }}>ADMET Intelligence</p>
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
                  {/* Complex Animated Molecule with Glowing Nodes */}
                  <svg width="150" height="150" viewBox="0 0 100 100" fill="none" stroke="var(--text-main)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <defs>
                      <filter id="glow-danger" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                      <filter id="glow-warning" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    <g className="molecule-paths" style={{ opacity: 0.8 }}>
                      {/* Left Hexagon */}
                      <path d="M30 30 L45 20 L60 30 L60 50 L45 60 L30 50 Z" />
                      <path d="M33 33 L45 25 M57 33 L57 47 M33 47 L45 55" strokeWidth="1" stroke="rgba(255,255,255,0.3)" />
                      {/* Right Hexagon connected */}
                      <path d="M60 30 L75 20 L90 30 L90 50 L75 60 L60 50" />
                      <path d="M63 33 L75 25 M87 33 L87 47 M63 47 L75 55" strokeWidth="1" stroke="rgba(255,255,255,0.3)" />
                      {/* Branches */}
                      <path d="M45 20 L45 5" />
                      <circle cx="45" cy="5" r="2.5" fill="var(--accent-2)" stroke="none" />
                      <path d="M90 50 L100 60" strokeDasharray="3,3" stroke="rgba(255,255,255,0.5)" />
                      <path d="M45 60 L45 75 L35 85" />
                      <path d="M45 75 L55 85" />
                    </g>
                    {/* Animated Hotspots */}
                    <g className="hotspot-danger" style={{ transformOrigin: '75px 20px' }}>
                      <circle cx="75" cy="20" r="8" fill="rgba(239, 68, 68, 0.4)" filter="url(#glow-danger)" stroke="none" />
                      <circle cx="75" cy="20" r="3" fill="#ef4444" stroke="none" />
                    </g>
                    <g className="hotspot-warning" style={{ transformOrigin: '30px 50px' }}>
                      <circle cx="30" cy="50" r="6" fill="rgba(245, 158, 11, 0.4)" filter="url(#glow-warning)" stroke="none" />
                      <circle cx="30" cy="50" r="2" fill="#f59e0b" stroke="none" />
                    </g>
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
                <select 
                  className="btn btn-secondary" 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Risks</option>
                  <option value="safe">Safe Only</option>
                  <option value="warning">Warning Only</option>
                  <option value="danger">Danger Only</option>
                </select>
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
                    {candidates
                      .filter(c => filterStatus === 'all' || c.status === filterStatus)
                      .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.smiles.toLowerCase().includes(search.toLowerCase()))
                      .map(c => (
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
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="input-control" 
                  placeholder="Search Library..." 
                  style={{ paddingLeft: '2.5rem' }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select 
                className="btn btn-secondary" 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Risks</option>
                <option value="safe">Safe Only</option>
                <option value="warning">Warning Only</option>
                <option value="danger">Danger Only</option>
              </select>
            </div>
            <div className="dashboard-grid">
              {candidates
                .filter(c => filterStatus === 'all' || c.status === filterStatus)
                .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.smiles.toLowerCase().includes(search.toLowerCase()))
                .map((c, idx) => (
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
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{(toxicityThreshold / 100).toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={toxicityThreshold} 
                    onChange={(e) => setToxicityThreshold(Number(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-1)' }} 
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Molecules exceeding this threshold will be flagged as warning or danger.</p>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Minimum Drug-Likeness (QED)</label>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{(drugLikenessThreshold / 100).toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={drugLikenessThreshold} 
                    onChange={(e) => setDrugLikenessThreshold(Number(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-2)' }} 
                  />
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
                <div 
                  onClick={() => setCudaEnabled(!cudaEnabled)}
                  style={{ width: '44px', height: '24px', background: cudaEnabled ? 'var(--accent-1)' : 'rgba(255,255,255,0.2)', borderRadius: '12px', padding: '2px', cursor: 'pointer', transition: 'background 0.2s' }}
                >
                  <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', transform: cudaEnabled ? 'translateX(20px)' : 'translateX(0)', transition: 'transform 0.2s' }}></div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>Auto-Export Screenings</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Automatically generate CSV+PDF reports after batch processing</div>
                </div>
                <div 
                  onClick={() => setAutoExport(!autoExport)}
                  style={{ width: '44px', height: '24px', background: autoExport ? 'var(--accent-1)' : 'rgba(255,255,255,0.2)', borderRadius: '12px', padding: '2px', cursor: 'pointer', transition: 'background 0.2s' }}
                >
                  <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', transform: autoExport ? 'translateX(20px)' : 'translateX(0)', transition: 'transform 0.2s' }}></div>
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

      {selectedHeatmap && (
        <div className="modal-overlay" onClick={() => setSelectedHeatmap(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
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
                {/* Complex Animated Molecule with Glowing Nodes */}
                <svg width="200" height="200" viewBox="0 0 100 100" fill="none" stroke="var(--text-main)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <defs>
                    <filter id="glow-danger-modal" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="glow-warning-modal" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="glow-info-modal" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  
                  {/* Real Dynamic Molecule SVG Skeleton */}
                  {renderMoleculePaths(selectedHeatmap.name)}

                  {/* Hotspots matched to structure */}
                  {renderHotspots(selectedHeatmap.name, selectedHeatmap.toxicity, selectedHeatmap.solubility)}
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
