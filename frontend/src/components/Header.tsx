import React from 'react';
import { Scale, Cpu, Layers, CheckCircle2 } from 'lucide-react';
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
        {/* Brand & Trademark */}
        <div className="brand-section">
          <div className="brand-logo-icon">
            <Scale size={18} strokeWidth={2.2} />
          </div>
          <div className="brand-titles">
            <div className="brand-title">
              LEXSPHERE<span className="brand-trademark">™</span>
              <span className="brand-title-badge">LEGAL INTELLIGENCE</span>
            </div>
            <span className="brand-subtitle">
              Hybrid RAG & Independent Citation Verification Workspace
            </span>
          </div>
        </div>

        {/* Minimal Controls */}
        <div className="header-controls">
          {/* Architecture & Pipeline Info Link */}
          <button 
            type="button"
            className="architecture-btn"
            onClick={() => setIsArchitectureModalOpen(true)}
            title="System architecture and pipeline overview"
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

          {/* Legal Corpus Availability Status */}
          <button
            type="button"
            className="status-pill-btn"
            onClick={() => setIsBackendStatusModalOpen(true)}
            title="LexSphere verified legal corpus status"
          >
            <CheckCircle2 size={12} style={{ color: '#34d399' }} />
            <span>
              {!isLive 
                ? `${documents.length} Legal Documents Available` 
                : isHealthy 
                  ? `Live Backend (${documents.length} Documents)` 
                  : 'Backend Offline'
              }
            </span>
          </button>

          {/* Small Llama Powered Badge */}
          <div className="status-pill-btn" style={{ cursor: 'default' }}>
            <Cpu size={12} style={{ color: 'var(--brand-gold)' }} />
            <span>Powered by Llama</span>
          </div>
        </div>
      </div>
    </header>
  );
};
