import React, { useState } from 'react';
import { 
  X, 
  Server, 
  RefreshCw 
} from 'lucide-react';
import { useLegalResearch } from '../context/LegalResearchContext';
import { API_BASE_URL } from '../services/legalApiService';

export const BackendStatusModal: React.FC = () => {
  const { 
    isBackendStatusModalOpen, 
    setIsBackendStatusModalOpen, 
    backendHealth, 
    refreshHealth, 
    activeMode, 
    toggleMode 
  } = useLegalResearch();

  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isBackendStatusModalOpen) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshHealth();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const isLive = activeMode === 'live';
  const isHealthy = backendHealth?.status === 'healthy';

  return (
    <div className="modal-overlay" onClick={() => setIsBackendStatusModalOpen(false)}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="status-modal-title"
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Server size={20} style={{ color: 'var(--brand-leather)' }} />
            <h2 id="status-modal-title" className="modal-title">
              Backend Integration & Health Status
            </h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={() => setIsBackendStatusModalOpen(false)}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Active Mode Banner */}
          <div style={{ background: isLive ? '#f0f7f2' : 'var(--bg-surface-sand)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: `1px solid ${isLive ? '#bce3c8' : 'var(--border-medium)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: isLive ? '#14592b' : 'var(--brand-leather)' }}>
                Current Mode: {isLive ? 'Live FastAPI Mode' : 'Demo Mode (Self-Contained Sample Corpus)'}
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Backend Target: <code style={{ fontFamily: 'var(--font-mono)' }}>{API_BASE_URL}</code>
              </div>
            </div>

            <button
              type="button"
              className={isLive ? 'btn-secondary' : 'btn-primary'}
              onClick={() => toggleMode(isLive ? 'demo' : 'live')}
            >
              Switch to {isLive ? 'Demo Mode' : 'Live FastAPI'}
            </button>
          </div>

          {/* Status Metrics */}
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">Gateway Status</span>
              <span className="metric-value" style={{ color: isHealthy ? '#14592b' : '#8c1e1a' }}>
                {backendHealth?.status || 'Unknown'}
              </span>
            </div>

            <div className="metric-item">
              <span className="metric-label">Local Ollama Model</span>
              <span className="metric-value" style={{ fontSize: '0.8rem' }}>
                {backendHealth?.ollama?.model || 'llama3:8b (Ollama)'}
              </span>
            </div>

            <div className="metric-item">
              <span className="metric-label">Indexed Documents</span>
              <span className="metric-value">
                {backendHealth?.indexStatus?.documentsCount || 5} Documents
              </span>
            </div>

            <div className="metric-item">
              <span className="metric-label">Vector Dimension</span>
              <span className="metric-value">
                {backendHealth?.indexStatus?.vectorDim || 768}-dim
              </span>
            </div>
          </div>

          {/* Integration Guide for Person 1 & Person 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              How Teammates (Person 1 & Person 2) Connect Local FastAPI:
            </h4>
            
            <ol style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginLeft: '1.25rem', lineHeight: 1.6 }}>
              <li>Run the FastAPI backend on <code>http://localhost:8000</code>.</li>
              <li>Expose CORS for <code>http://localhost:5173</code> (or <code>["*"]</code>).</li>
              <li>Ensure <code>GET /api/health</code>, <code>GET /api/documents</code>, <code>POST /api/research/query</code> match <code>docs/API_CONTRACT.md</code>.</li>
              <li>Toggle the header switcher to <strong>Live FastAPI</strong>.</li>
            </ol>

            <div className="troubleshoot-code-block">
              <div style={{ color: '#c4933f', marginBottom: '0.25rem' }}># FastAPI Sample Integration (main.py):</div>
              <div>app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])</div>
              <div># Ollama runs locally on http://localhost:11434 behind FastAPI</div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-pulse-subtle' : ''} />
            {isRefreshing ? 'Checking...' : 'Refresh Health Check'}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setIsBackendStatusModalOpen(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
