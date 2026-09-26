import React from 'react';
import { 
  Scale, 
  ShieldCheck, 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  FileCheck, 
  Lock, 
  Search, 
  FileText, 
  Copy,
  Info
} from 'lucide-react';
import { useLegalResearch } from '../../context/LegalResearchContext';

export const HomePage: React.FC = () => {
  const { setActiveNavPage } = useLegalResearch();

  return (
    <div className="page-container animate-fade-in">
      {/* Hero Section */}
      <section className="home-hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Scale size={14} style={{ color: 'var(--brand-gold)' }} />
            <span>ENTERPRISE LEGAL INTELLIGENCE</span>
          </div>

          <h1 className="hero-headline">
            Grounded Legal Intelligence & Independent Citation Verification
          </h1>

          <p className="hero-subheadline">
            Engineered for advocates, judicial clerks, and law firms. Analyze judicial precedents, verify statutory claims with propositional entailment, and conduct hallucination-free legal discovery.
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

            <button
              type="button"
              className="btn-secondary hero-btn-sub"
              onClick={() => setActiveNavPage('about')}
            >
              <Info size={15} />
              <span>About Platform</span>
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
            <div className="metric-box">
              <span className="metric-number">Security</span>
              <span className="metric-title">Client Confidentiality</span>
              <span className="metric-sub">Private Local Inference</span>
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
              Enter natural language questions regarding statutory interpretation, liability standards, or ratios. Choose from benchmark templates or type custom inquiries.
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
            <h3 className="process-card-title">Audit Verbatim Judicial Proof</h3>
            <p className="process-card-desc">
              Click any citation badge to inspect the exact verbatim paragraph, section clause, and propositional entailment rationale in the verification audit tab.
            </p>
            <div className="process-card-meta">
              <CheckCircle2 size={12} style={{ color: 'var(--status-verified-text)' }} />
              <span>One-Click Evidence Inspection</span>
            </div>
          </div>

          {/* Step 4 */}
          <div className="process-card">
            <div className="process-card-header">
              <span className="process-step-pill">Stage 04</span>
              <Copy size={18} style={{ color: 'var(--brand-leather)' }} />
            </div>
            <h3 className="process-card-title">Export Verified Work Product</h3>
            <p className="process-card-desc">
              Copy verified analysis directly into court petitions, legal opinions, or memos with full confidence that every cited authority is sound.
            </p>
            <div className="process-card-meta">
              <CheckCircle2 size={12} style={{ color: 'var(--status-verified-text)' }} />
              <span>Court-Ready Brief Integration</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Capabilities Grid */}
      <section className="home-section">
        <div className="section-header-center">
          <div className="section-eyebrow">ENTERPRISE ASSURANCE</div>
          <h2 className="section-title">Built for Legal Precision</h2>
          <p className="section-desc">
            Designed specifically for law firms requiring verifiable evidence and strict data governance.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-item-card">
            <div className="feature-icon-wrapper">
              <ShieldCheck size={22} />
            </div>
            <h3 className="feature-title">Independent Citation Verification</h3>
            <p className="feature-desc">
              Every factual assertion and statutory claim undergoes proposition-level entailment verification against the source document.
            </p>
          </div>

          <div className="feature-item-card">
            <div className="feature-icon-wrapper">
              <BookOpen size={22} />
            </div>
            <h3 className="feature-title">Grounded Legal Precedent</h3>
            <p className="feature-desc">
              Synthesizes arguments strictly from verified statutory frameworks and Constitution Bench jurisprudence without external hallucinations.
            </p>
          </div>

          <div className="feature-item-card">
            <div className="feature-icon-wrapper">
              <FileText size={22} />
            </div>
            <h3 className="feature-title">Deep-Linked Audit Trails</h3>
            <p className="feature-desc">
              Clickable citation chips ([1], [2]) seamlessly navigate to verbatim paragraphs, section clauses, and judicial reasoning.
            </p>
          </div>

          <div className="feature-item-card">
            <div className="feature-icon-wrapper">
              <Lock size={22} />
            </div>
            <h3 className="feature-title">Enterprise Data Confidentiality</h3>
            <p className="feature-desc">
              Designed with enterprise security standards ensuring zero external data leakage and robust client privilege protections.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="home-cta-banner">
        <div className="cta-banner-content">
          <h2 className="cta-banner-title">
            Start Your Verifiable Legal Research
          </h2>
          <p className="cta-banner-desc">
            Analyze complex statutory provisions and landmark jurisprudence with instant citation verification.
          </p>
          <button
            type="button"
            className="btn-primary cta-banner-btn"
            onClick={() => setActiveNavPage('workspace')}
          >
            <span>Open LexSphere™ Workspace</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
};
