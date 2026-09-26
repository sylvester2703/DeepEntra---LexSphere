import React from 'react';
import { Scale, Home, Search, LucideIcon, ArrowRight } from 'lucide-react';
import { useLegalResearch, NavPage } from '../context/LegalResearchContext';

export const Header: React.FC = () => {
  const { 
    activeNavPage,
    setActiveNavPage 
  } = useLegalResearch();

  const navItems: { id: NavPage; label: string; icon: LucideIcon }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'workspace', label: 'Workspace', icon: Search },
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

        {/* Minimal Enterprise Action */}
        <div className="header-controls">
          {activeNavPage !== 'workspace' && (
            <button
              type="button"
              className="btn-primary"
              onClick={() => setActiveNavPage('workspace')}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.95rem' }}
            >
              <span>Research Workspace</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
