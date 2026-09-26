import React from 'react';
import { Scale, Cpu, Layers } from 'lucide-react';
import { useLegalResearch } from '../context/LegalResearchContext';

export const Header: React.FC = () => {
  const { 
    activeMode, 
    toggleMode, 
    backendHealth, 
    setIsArchitectureModalOpen, 
    setIsBackendStatusModalOpen,
    documents 
  } = useLegalResearch();

  const isLive = activeMode === 'live';
  const isHealthy = backendHealth?.status === 'healthy';

  return (
    <header className="header-container" role="banner">
      <div className="header-inner">
        {/* Brand & Subtitle */}
        <div className="brand-section">
          <div className="brand-logo-icon">
            <Scale size={18} strokeWidth={2.2} />
          </div>
          <div className="brand-titles">
            <div className="brand-title">
              LEXSPHERE
              <span className="brand-title-badge">Legal Intelligence</span>
            </div>
            <span className="brand-subtitle">
              Hybrid RAG & Independent Citation Verification Workspace
            </span>
          </div>
        </div>

        {/* Essential Navigation Controls Only */}
        <div className="header-controls">
          {/* Architecture & Pipeline Action */}
          <button 
            type="button"
            className="architecture-btn"
            onClick={() => setIsArchitectureModalOpen(true)}
            title="Inspect retrieval pipeline architecture"
          >
            <Layers size={13} />
            <span>Architecture & Pipeline</span>
          </button>

          {/* Mode Selector */}
          <div className="mode-toggle-group" role="group" aria-label="Operating Mode">
            <button
              type="button"
              className={`mode-btn ${!isLive ? 'active-mode' : ''}`}
              onClick={() => toggleMode('demo')}
            >
              Demo Mode
            </button>
            <button
              type="button"
              className={`mode-btn ${isLive ? 'active-live' : ''}`}
              onClick={() => toggleMode('live')}
            >
              Live API
            </button>
          </div>

          {/* Corpus Status */}
          <button
            type="button"
            className="status-pill-btn"
            onClick={() => setIsBackendStatusModalOpen(true)}
            title="Inspect backend and corpus status"
          >
            <span 
              className={`status-dot ${
                !isLive 
                  ? 'demo' 
                  : isHealthy 
                    ? 'online' 
                    : 'offline'
              }`} 
            />
            <span>
              {!isLive 
                ? `${documents.length} Corpus Docs` 
                : isHealthy 
                  ? `Live (${documents.length} Docs)` 
                  : 'API Offline'
              }
            </span>
          </button>

          {/* Model Status */}
          <div className="status-pill-btn" style={{ cursor: 'default' }}>
            <Cpu size={13} style={{ color: 'var(--brand-gold)' }} />
            <span>Llama 3 (Ollama)</span>
          </div>
        </div>
      </div>
    </header>
  );
};
