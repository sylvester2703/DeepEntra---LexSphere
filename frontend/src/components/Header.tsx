import React from 'react';
import { Scale, CheckCircle2 } from 'lucide-react';
import { useLegalResearch } from '../context/LegalResearchContext';

export const Header: React.FC = () => {
  const { 
    activeMode, 
    toggleMode, 
    backendHealth, 
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
              AI-Powered Legal Research & Verification Platform
            </span>
          </div>
        </div>

        {/* Minimal Controls */}
        <div className="header-controls">
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

          {/* Legal Corpus Status */}
          <button
            type="button"
            className="status-pill-btn"
            onClick={() => setIsBackendStatusModalOpen(true)}
            title="LexSphere verified legal corpus status"
          >
            <CheckCircle2 size={12} style={{ color: '#34d399' }} />
            <span>
              {!isLive 
                ? `${documents.length || 5} Documents Available` 
                : isHealthy 
                  ? `Live Backend (${documents.length} Docs)` 
                  : 'Backend Offline'
              }
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
