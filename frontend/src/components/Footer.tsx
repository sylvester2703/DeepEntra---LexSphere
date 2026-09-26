import React from 'react';
import { Scale } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer-container" role="contentinfo">
      <div className="footer-inner">
        <div className="footer-top-grid">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <div className="footer-brand-title">
              <Scale size={18} style={{ color: 'var(--brand-gold)' }} />
              LEXSPHERE<span className="brand-trademark">™</span>
            </div>
            <p className="footer-brand-tagline">
              AI-Powered Legal Research & Citation Verification Platform engineered for lawyers, judicial researchers, and law firms.
            </p>
            <div className="footer-contact-info">
              <span>Support & Partnerships:</span>
              <a href="mailto:support@lexsphere.ai" className="footer-contact-email">
                support@lexsphere.ai
              </a>
            </div>
          </div>

          {/* Column 1: Product */}
          <div className="footer-col">
            <h4 className="footer-col-title">Product</h4>
            <ul className="footer-nav-list">
              <li><span className="footer-nav-link">Legal Research</span></li>
              <li><span className="footer-nav-link">Citation Verification</span></li>
              <li><span className="footer-nav-link">Document Intelligence</span></li>
              <li><span className="footer-nav-link">Statutory Discovery</span></li>
            </ul>
          </div>

          {/* Column 2: Company */}
          <div className="footer-col">
            <h4 className="footer-col-title">Company</h4>
            <ul className="footer-nav-list">
              <li><span className="footer-nav-link">About LexSphere</span></li>
              <li><span className="footer-nav-link">Methodology & RAG</span></li>
              <li><span className="footer-nav-link">Contact Us</span></li>
              <li><span className="footer-nav-link">Security & Privacy</span></li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="footer-col">
            <h4 className="footer-col-title">Legal</h4>
            <ul className="footer-nav-list">
              <li><span className="footer-nav-link">Privacy Policy</span></li>
              <li><span className="footer-nav-link">Terms of Use</span></li>
              <li><span className="footer-nav-link">Compliance Standards</span></li>
              <li><span className="footer-nav-link">Attorney Disclaimer</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div>
            © 2026 LexSphere™. All rights reserved. Professional Legal Intelligence.
          </div>
          <div style={{ fontSize: '0.725rem' }}>
            Curated Legal Corpus • Independent Entailment Verification
          </div>
        </div>
      </div>
    </footer>
  );
};
