import React from 'react';
import { 
  Scale, 
  ShieldCheck, 
  Users, 
  ArrowRight,
  Lock,
  Cpu,
  FileText,
  ShieldAlert,
  Award
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

      {/* Legal & Governance Section (Wired to Footer Navigation Links) */}
      <section className="home-section" style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '3rem 2.5rem', border: '1px solid var(--border-subtle)', marginTop: '2.5rem' }}>
        <div className="section-header-center">
          <div className="section-eyebrow">GOVERNANCE & STANDARDS</div>
          <h2 className="section-title">Legal & Regulatory Framework</h2>
          <p className="section-desc">
            Complete transparency regarding data handling, attorney-client privilege protections, compliance, and terms of service.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '960px', margin: '0 auto' }}>
          {/* Privacy Policy */}
          <div id="privacy-policy" className="surface-card" style={{ padding: '1.5rem', borderLeft: '3px solid var(--brand-leather)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Lock size={18} style={{ color: 'var(--brand-leather)' }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                Privacy Policy & Zero-Retention Architecture
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              LexSphere™ operates under a strict privacy-first covenant. Queries processed through local inference backends remain within the firm's private enclave. We do not log, retain, sell, or utilize legal inquiries, draft petitions, or citations for language model fine-tuning.
            </p>
          </div>

          {/* Terms of Service */}
          <div id="terms-of-service" className="surface-card" style={{ padding: '1.5rem', borderLeft: '3px solid var(--brand-gold)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <FileText size={18} style={{ color: 'var(--brand-gold)' }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                Terms of Service & Licensing
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              LexSphere™ is licensed for professional legal research, litigation preparation, and academic analysis. Users retain full proprietary ownership over all exported memoranda, research notes, and drafted legal analyses generated with the platform.
            </p>
          </div>

          {/* Compliance Standards */}
          <div id="compliance-standards" className="surface-card" style={{ padding: '1.5rem', borderLeft: '3px solid var(--status-verified-text)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={18} style={{ color: 'var(--status-verified-text)' }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                Compliance & Security Standards
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Designed to align with global security frameworks and the Digital Personal Data Protection Act 2023. Backends support end-to-end TLS 1.3 encryption in transit and AES-256 encryption at rest, meeting the compliance requirements of top-tier litigation chambers.
            </p>
          </div>

          {/* Attorney-Client Disclaimer */}
          <div id="attorney-client-disclaimer" className="surface-card" style={{ padding: '1.5rem', borderLeft: '3px solid var(--brand-leather)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldAlert size={18} style={{ color: 'var(--brand-leather)' }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                Attorney-Client Privilege & Legal Disclaimer
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              LexSphere™ is an AI-powered legal intelligence assistance tool intended to aid qualified advocates and researchers. Use of the platform does not create a lawyer-client relationship. All verified citations and statutory excerpts should be reviewed by legal counsel prior to formal court submissions.
            </p>
          </div>

          {/* Trademark Notice */}
          <div id="trademark-notice" className="surface-card" style={{ padding: '1.5rem', borderLeft: '3px solid var(--brand-gold)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Award size={18} style={{ color: 'var(--brand-gold)' }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                Trademark & Intellectual Property Notice
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              LEXSPHERE™, the LexSphere scale emblem, and associated brand marks are trademarks of LexSphere™ Technologies Inc. All judicial citations, public act names, and statutory provisions remain in the public domain under relevant open government and judicial publications guidelines.
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
