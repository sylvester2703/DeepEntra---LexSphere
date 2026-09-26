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
    <header className="header-container">
      <div className="header-inner">
        {/* Brand Identity */}
        <div className="brand-section">
          <div className="brand-logo-icon">
            <Scale size={22} strokeWidth={2.2} />
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

        {/* Global Controls & Status */}
        <div className="header-controls">
          {/* Architecture Transparency Button */}
          <button 
            type="button"
            className="architecture-btn"
            onClick={() => setIsArchitectureModalOpen(true)}
            title="Inspect how LexSphere answers are prepared"
          >
            <Layers size={14} />
            <span>Architecture & Pipeline</span>
          </button>

          {/* Mode Switcher: Demo vs Live FastAPI */}
          <div className="mode-toggle-group" role="group" aria-label="Operating Mode">
            <button
              type="button"
              className={`mode-btn ${!isLive ? 'active-mode' : ''}`}
              onClick={() => toggleMode('demo')}
              title="Self-contained demo mode with curated legal corpus"
            >
              Demo Mode
            </button>
            <button
              type="button"
              className={`mode-btn ${isLive ? 'active-live' : ''}`}
              onClick={() => toggleMode('live')}
              title="Connect to local FastAPI backend (Person 1 RAG + Person 2 Verification)"
            >
              Live FastAPI
            </button>
          </div>

          {/* Backend Status Pill */}
          <button
            type="button"
            className="status-pill-btn"
            onClick={() => setIsBackendStatusModalOpen(true)}
            title="Inspect backend and local Ollama model connection"
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
                ? 'Demo Corpus (5 Docs)' 
                : isHealthy 
                  ? `FastAPI Online (${documents.length} Docs)` 
                  : 'FastAPI Offline'
              }
            </span>
          </button>

          {/* Ollama / RAG Pill */}
          <div className="status-pill-btn" style={{ cursor: 'default' }}>
            <Cpu size={14} style={{ color: 'var(--brand-gold)' }} />
            <span>Llama 3 (Ollama)</span>
          </div>
        </div>
      </div>
    </header>
  );
};
