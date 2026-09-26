import React from 'react';
import { Scale, Mail, Phone, MapPin } from 'lucide-react';
import { useLegalResearch, NavPage } from '../context/LegalResearchContext';

export const Footer: React.FC = () => {
  const { setActiveNavPage } = useLegalResearch();

  const handleNav = (page: NavPage) => {
    setActiveNavPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-container" role="contentinfo">
      <div className="footer-inner">
        <div className="footer-top-grid">
          {/* Brand & Contact Column */}
          <div className="footer-brand-col">
            <div 
              className="footer-brand-title" 
              onClick={() => handleNav('home')} 
              style={{ cursor: 'pointer' }}
              title="Return to LexSphere Home"
            >
              <Scale size={20} style={{ color: 'var(--brand-gold)' }} />
              LEXSPHERE<span className="brand-trademark">™</span>
            </div>
            <p className="footer-brand-tagline">
              AI-Powered Legal Research & Citation Verification Platform engineered for advocates, judicial clerks, law firms, and legal researchers.
            </p>
            
            <div className="footer-contact-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={13} style={{ color: 'var(--brand-gold)' }} />
                <span>Support: </span>
                <a href="mailto:support@lexsphere.ai" className="footer-contact-email">
                  support@lexsphere.ai
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={13} style={{ color: 'var(--brand-gold)' }} />
                <span>Legal Inquiries: </span>
                <a href="mailto:legal@lexsphere.ai" className="footer-contact-email">
                  legal@lexsphere.ai
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={13} style={{ color: 'var(--brand-gold)' }} />
                <span>Helpline: +91 (11) 4920-5000 / +1 (800) 539-7743</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={13} style={{ color: 'var(--brand-gold)' }} />
                <span>One Legal Plaza, Suite 400 • Legal AI Technology Park</span>
              </div>
            </div>
          </div>

          {/* Column 1: Product */}
          <div className="footer-col">
            <h4 className="footer-col-title">Product</h4>
            <ul className="footer-nav-list">
              <li>
                <span className="footer-nav-link" onClick={() => handleNav('workspace')}>
                  Legal Research Workspace
                </span>
              </li>
              <li>
                <span className="footer-nav-link" onClick={() => handleNav('workspace')}>
                  Citation Verification
                </span>
              </li>
              <li>
                <span className="footer-nav-link" onClick={() => handleNav('corpus')}>
                  Curated Legal Documents
                </span>
              </li>
              <li>
                <span className="footer-nav-link" onClick={() => handleNav('corpus')}>
                  Statutory Discovery
                </span>
              </li>
              <li>
                <span className="footer-nav-link" onClick={() => handleNav('workspace')}>
                  Propositional Entailment
                </span>
              </li>
            </ul>
          </div>

          {/* Column 2: Company */}
          <div className="footer-col">
            <h4 className="footer-col-title">Company</h4>
            <ul className="footer-nav-list">
              <li>
                <span className="footer-nav-link" onClick={() => handleNav('about')}>
                  About LexSphere™
                </span>
              </li>
              <li>
                <span className="footer-nav-link" onClick={() => handleNav('corpus')}>
                  Verified Legal Corpus
                </span>
              </li>
              <li>
                <span className="footer-nav-link" onClick={() => handleNav('contact')}>
                  Contact & Support
                </span>
              </li>
              <li>
                <span className="footer-nav-link" onClick={() => handleNav('about')}>
                  Security & Privacy
                </span>
              </li>
              <li>
                <span className="footer-nav-link" onClick={() => handleNav('contact')}>
                  Law Firm Deployments
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Governance */}
          <div className="footer-col">
            <h4 className="footer-col-title">Legal & Governance</h4>
            <ul className="footer-nav-list">
              <li>
                <span className="footer-nav-link" onClick={() => handleNav('about')}>
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="footer-nav-link" onClick={() => handleNav('about')}>
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="footer-nav-link" onClick={() => handleNav('about')}>
                  Compliance Standards
                </span>
              </li>
              <li>
                <span className="footer-nav-link" onClick={() => handleNav('about')}>
                  Attorney-Client Disclaimer
                </span>
              </li>
              <li>
                <span className="footer-nav-link" onClick={() => handleNav('about')}>
                  Trademark Notice
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div>
            © 2026 LexSphere™ Technologies Inc. All rights reserved. LexSphere™ is a registered trademark.
          </div>
          <div style={{ fontSize: '0.725rem' }}>
            Curated Legal Corpus • Independent Entailment Verification
          </div>
        </div>
      </div>
    </footer>
  );
};
