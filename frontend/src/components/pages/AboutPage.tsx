import React from 'react';
import { 
  Scale, 
  ShieldCheck, 
  Users, 
  ArrowRight,
  Lock,
  Cpu
} from 'lucide-react';
import { useLegalResearch } from '../../context/LegalResearchContext';

export const AboutPage: React.FC = () => {
  const { setActiveNavPage } = useLegalResearch();

  return (
    <div className="page-container animate-fade-in">
      {/* Page Header */}
      <section className="page-header-section">
        <div className="page-header-badge">
          <Scale size={14} style={{ color: 'var(--brand-gold)' }} />
          <span>ABOUT LEXSPHERE™</span>
        </div>
        <h1 className="page-title">Pioneering Verifiable Legal Intelligence</h1>
        <p className="page-subtitle">
          LexSphere™ was engineered to solve the fundamental challenge of generative AI in law: eliminating hallucinations through strict propositional grounding and independent citation verification.
        </p>
      </section>

      {/* Mission & Vision Grid */}
      <section className="about-grid-section">
        <div className="about-card primary-card">
          <div className="about-card-icon">
            <ShieldCheck size={26} style={{ color: 'var(--brand-leather)' }} />
          </div>
          <h2 className="about-card-title">Our Legal Technology Mission</h2>
          <p className="about-card-text">
            In the practice of law, an unverified citation or subtle hallucination can undermine an entire brief. LexSphere™ bridges cutting-edge Large Language Models with automated propositional entailment to ensure that every assertion is backed by verbatim statutory or judicial authority.
          </p>
        </div>

        <div className="about-card secondary-card">
          <div className="about-card-icon">
            <Lock size={26} style={{ color: 'var(--brand-gold)' }} />
          </div>
          <h2 className="about-card-title">Client Privacy & Data Sovereignty</h2>
          <p className="about-card-text">
            Designed from the ground up for law firms, legal departments, and judicial institutions with strict confidentiality needs. We prioritize private, locally executable language model pipelines that prevent proprietary client data from leaving your secure infrastructure.
          </p>
        </div>
      </section>

      {/* The 3 Core Pillars */}
      <section className="home-section" style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '3rem 2.5rem', border: '1px solid var(--border-subtle)', marginTop: '2.5rem' }}>
        <div className="section-header-center">
          <div className="section-eyebrow">MODULAR ARCHITECTURE</div>
          <h2 className="section-title">The Three Pillars of LexSphere™</h2>
          <p className="section-desc">
            A balanced integration of neural retrieval, grounded reasoning, and automated proof verification.
          </p>
        </div>

        <div className="pillars-grid">
          <div className="pillar-item">
            <div className="pillar-header">
              <span className="pillar-number">01</span>
              <Cpu size={20} style={{ color: 'var(--brand-leather)' }} />
            </div>
            <h3 className="pillar-title">Grounded Hybrid Generation</h3>
            <p className="pillar-desc">
              Leverages local LLM inference coupled with sparse lexical lookup and dense semantic retrieval to synthesize context strictly from verified legal corpus documents.
            </p>
          </div>

          <div className="pillar-item">
            <div className="pillar-header">
              <span className="pillar-number">02</span>
              <ShieldCheck size={20} style={{ color: 'var(--status-verified-text)' }} />
            </div>
            <h3 className="pillar-title">Independent Citation Verification</h3>
            <p className="pillar-desc">
              An isolated natural language inference (NLI) module inspects every generated statement, classifying claims as Verified, Partially Supported, or Unverified.
            </p>
          </div>

          <div className="pillar-item">
            <div className="pillar-header">
              <span className="pillar-number">03</span>
              <Users size={20} style={{ color: 'var(--brand-gold)' }} />
            </div>
            <h3 className="pillar-title">Enterprise Legal Workspace</h3>
            <p className="pillar-desc">
              A high-productivity, typography-first user interface crafted specifically for legal practitioners, providing one-click deep links directly into source paragraphs.
            </p>
          </div>
        </div>
      </section>

      {/* The Benchmark Corpus */}
      <section className="home-section" style={{ marginTop: '2.5rem' }}>
        <div className="section-header-center">
          <div className="section-eyebrow">VERIFIED AUTHORITIES</div>
          <h2 className="section-title">Curated Legal Benchmark Corpus</h2>
          <p className="section-desc">
            LexSphere™ is pre-loaded with landmark Indian legal authorities representing key domains of law.
          </p>
        </div>

        <div className="about-corpus-list">
          <div className="about-corpus-item">
            <div className="about-corpus-badge">Contract Law</div>
            <h4 className="about-corpus-title">Kailash Nath Associates v. DDA (2015)</h4>
            <p className="about-corpus-summary">
              Definitive Supreme Court ruling establishing that Section 74 liquidated damages and earnest money forfeitures require proof of actual loss unless damage is impossible to calculate.
            </p>
          </div>

          <div className="about-corpus-item">
            <div className="about-corpus-badge">Contract Law</div>
            <h4 className="about-corpus-title">The Indian Contract Act, 1872</h4>
            <p className="about-corpus-summary">
              Governing statutory framework for contract breach, reasonable compensation (Section 73), and penalty vs liquidated damages stipulations (Section 74).
            </p>
          </div>

          <div className="about-corpus-item">
            <div className="about-corpus-badge">Privacy Law</div>
            <h4 className="about-corpus-title">Digital Personal Data Protection Act, 2023</h4>
            <p className="about-corpus-summary">
              India's comprehensive statutory framework regulating personal data processing, legitimate use exemptions without consent (Section 7), and Data Principal rights.
            </p>
          </div>

          <div className="about-corpus-item">
            <div className="about-corpus-badge">Constitutional Law</div>
            <h4 className="about-corpus-title">Justice K.S. Puttaswamy v. Union of India (2017)</h4>
            <p className="about-corpus-summary">
              9-judge Constitution Bench ruling affirming privacy as a fundamental right under Article 21 and establishing the mandatory four-part proportionality test.
            </p>
          </div>

          <div className="about-corpus-item">
            <div className="about-corpus-badge">Constitutional Law</div>
            <h4 className="about-corpus-title">Kesavananda Bharati v. State of Kerala (1973)</h4>
            <p className="about-corpus-summary">
              Landmark 13-judge bench decision laying down the Basic Structure Doctrine restricting parliamentary amending power under Article 368.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="home-cta-banner" style={{ marginTop: '3rem' }}>
        <div className="cta-banner-content">
          <h2 className="cta-banner-title">Experience Verifiable Legal AI</h2>
          <p className="cta-banner-desc">
            Test our citation verification engine on landmark Indian jurisprudence right in your browser.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-primary cta-banner-btn"
              onClick={() => setActiveNavPage('workspace')}
            >
              <span>Launch Research Workspace</span>
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}
              onClick={() => setActiveNavPage('contact')}
            >
              <span>Contact Legal Team</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
