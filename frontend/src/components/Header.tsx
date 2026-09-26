import React from 'react';
import { Scale, CheckCircle2, Home, Search, BookOpen, Info, Mail, LucideIcon } from 'lucide-react';
import { useLegalResearch, NavPage } from '../context/LegalResearchContext';

export const Header: React.FC = () => {
  const { 
    activeMode, 
    toggleMode, 
    backendHealth, 
    setIsBackendStatusModalOpen,
    documents,
    activeNavPage,
    setActiveNavPage 
  } = useLegalResearch();

  const isLive = activeMode === 'live';
  const isHealthy = backendHealth?.status === 'healthy';

  const navItems: { id: NavPage; label: string; icon: LucideIcon }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'workspace', label: 'Workspace', icon: Search },
    { id: 'corpus', label: 'Legal Corpus', icon: BookOpen },
    { id: 'about', label: 'About', icon: Info },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  return (
    <header className="header-container" role="banner">
      <div className="header-inner">
        {/* Brand & Trademark */}
        <div 
          className="brand-section" 
          onClick={() => setActiveNavPage('home')}
          style={{ cursor: 'pointer' }}
          title="Return to LexSphere Home"
        >
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

        {/* Center Main Navigation */}
        <nav className="header-nav-center" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNavPage === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={`header-nav-tab ${isActive ? 'active' : ''}`}
                onClick={() => setActiveNavPage(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Minimal Controls */}
        <div className="header-controls">
          {/* Mode Selector */}
          <div className="mode-toggle-group" role="group" aria-label="Operating Mode">
            <button
              type="button"
              className={`mode-btn ${!isLive ? 'active-mode' : ''}`}
              onClick={() => toggleMode('demo')}
            >
              Demo
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
                ? `${documents.length || 5} Documents` 
                : isHealthy 
                  ? `Live Backend` 
                  : 'Backend Offline'
              }
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
