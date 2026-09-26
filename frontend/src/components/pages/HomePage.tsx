import React from 'react';
import { 
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  Search
} from 'lucide-react';
import { useLegalResearch } from '../../context/LegalResearchContext';

export const HomePage: React.FC = () => {
  const { setActiveNavPage } = useLegalResearch();

  return (
    <div className="page-container animate-fade-in">
      {/* Hero Section */}
      <section className="home-hero-section">
        <div className="hero-content">

          <h1 className="hero-headline">
            Grounded Legal Intelligence & Independent Citation Verification
          </h1>

          <p className="hero-subheadline">
            Built for lawyers and legal professionals to quickly find relevant judgments, verify legal information, and get reliable AI-powered legal assistance.
          </p>

          <div className="hero-cta-group">
            <button
              type="button"
              className="btn-primary hero-btn-main"
              onClick={() => setActiveNavPage('workspace')}
            >
              <span>Launch Research Workspace</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Qualitative Pillars Bar */}
          <div className="hero-metrics-grid">
            <div className="metric-box">
              <span className="metric-number">Grounding</span>
              <span className="metric-title">Authoritative Law</span>
              <span className="metric-sub">Supreme Court & Statutes</span>
            </div>
            <div className="metric-box">
              <span className="metric-number">Verification</span>
              <span className="metric-title">Propositional Entailment</span>
              <span className="metric-sub">Direct Source Proof</span>
            </div>
            <div className="metric-box">
              <span className="metric-number">Precision</span>
              <span className="metric-title">Zero Hallucinations</span>
              <span className="metric-sub">Strict Source Citation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive "How to Use LexSphere" Process Guide */}
      <section className="home-section" style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '3rem 2.5rem', border: '1px solid var(--border-subtle)' }}>
        <div className="section-header-center">
          <div className="section-eyebrow">RESEARCH WORKFLOW & USER GUIDE</div>
          <h2 className="section-title">How to Use LexSphere™ for Legal Research</h2>
          <p className="section-desc">
            A systematic legal discovery workflow designed for precision, auditability, and court-ready work product.
          </p>
        </div>

        <div className="process-guide-grid">
          {/* Step 1 */}
          <div className="process-card">
            <div className="process-card-header">
              <span className="process-step-pill">Stage 01</span>
              <Search size={18} style={{ color: 'var(--brand-leather)' }} />
            </div>
            <h3 className="process-card-title">Formulate Legal Inquiries</h3>
            <p className="process-card-desc">
              Enter natural language questions regarding legal issues, statutes, or case law. 
            </p>
            <div className="process-card-meta">
              <CheckCircle2 size={12} style={{ color: 'var(--status-verified-text)' }} />
              <span>Doctrine & Statutory Inquiry</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="process-card">
            <div className="process-card-header">
              <span className="process-step-pill">Stage 02</span>
              <FileCheck size={18} style={{ color: 'var(--brand-leather)' }} />
            </div>
            <h3 className="process-card-title">Review Grounded Analysis</h3>
            <p className="process-card-desc">
              Read concise, structured legal findings where every single sentence is linked directly to authoritative sources via interactive citation chips ([1], [2]).
            </p>
            <div className="process-card-meta">
              <CheckCircle2 size={12} style={{ color: 'var(--status-verified-text)' }} />
              <span>Zero Hallucination Guarantee</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="process-card">
            <div className="process-card-header">
              <span className="process-step-pill">Stage 03</span>
              <ShieldCheck size={18} style={{ color: 'var(--brand-leather)' }} />
            </div>
            <h3 className="process-card-title">Audit Judicial Proof</h3>
            <p className="process-card-desc">
              Click any citation badge to inspect the exact paragraph, section clause, and propositions in the verification audit tab.
            </p>
            <div className="process-card-meta">
              <CheckCircle2 size={12} style={{ color: 'var(--status-verified-text)' }} />
              <span>One-Click Evidence Inspection</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
