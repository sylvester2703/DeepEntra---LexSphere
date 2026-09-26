import React from 'react';
import { 
  Scale, 
  ShieldCheck, 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  FileCheck, 
  Lock
} from 'lucide-react';
import { useLegalResearch } from '../../context/LegalResearchContext';
import { SAMPLE_RESEARCH_QUESTIONS } from '../../services/demoData';

export const HomePage: React.FC = () => {
  const { setActiveNavPage, selectSampleQuestion, documents } = useLegalResearch();

  const handleLaunchSample = (sampleId: string) => {
    const sample = SAMPLE_RESEARCH_QUESTIONS.find(s => s.id === sampleId);
    if (sample) {
      selectSampleQuestion(sample);
      setActiveNavPage('workspace');
    }
  };

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
            Engineered for lawyers, judicial researchers, and law firms. Analyze landmark Indian precedents, verify statutory claims with propositional entailment, and conduct hallucination-free legal discovery.
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
              onClick={() => setActiveNavPage('corpus')}
            >
              <BookOpen size={15} />
              <span>Explore 5 Curated Documents</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="hero-metrics-grid">
            <div className="metric-box">
              <span className="metric-number">5</span>
              <span className="metric-title">Curated Legal Documents</span>
              <span className="metric-sub">Supreme Court & Statutes</span>
            </div>
            <div className="metric-box">
              <span className="metric-number">100%</span>
              <span className="metric-title">Propositional Verification</span>
              <span className="metric-sub">Direct Source Entailment</span>
            </div>
            <div className="metric-box">
              <span className="metric-number">Zero</span>
              <span className="metric-title">Hallucination Tolerance</span>
              <span className="metric-sub">Strict Source Grounding</span>
            </div>
            <div className="metric-box">
              <span className="metric-number">Privacy</span>
              <span className="metric-title">Client Confidentiality</span>
              <span className="metric-sub">Safe Local Inference</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benchmark Questions Showcase */}
      <section className="home-section">
        <div className="section-header-center">
          <div className="section-eyebrow">READY-TO-EXPLORE BENCHMARKS</div>
          <h2 className="section-title">Verified Legal Research Scenarios</h2>
          <p className="section-desc">
            Explore pre-verified answers and citation audits grounded in our verified Indian legal corpus.
          </p>
        </div>

        <div className="benchmark-cards-grid">
          {SAMPLE_RESEARCH_QUESTIONS.map((sample) => (
            <div key={sample.id} className="benchmark-interactive-card">
              <div className="benchmark-card-badge-row">
                <span className="benchmark-tag">{sample.category}</span>
                <span className="benchmark-status">
                  <CheckCircle2 size={12} /> Verified
                </span>
              </div>

              <h3 className="benchmark-card-title">{sample.title}</h3>
              <p className="benchmark-card-query">"{sample.query}"</p>

              <button
                type="button"
                className="benchmark-card-cta"
                onClick={() => handleLaunchSample(sample.id)}
              >
                <span>Analyze Scenario in Workspace</span>
                <ArrowRight size={13} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Core Platform Capabilities Grid */}
      <section className="home-section" style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '3rem 2.5rem', border: '1px solid var(--border-subtle)' }}>
        <div className="section-header-center">
          <div className="section-eyebrow">ARCHITECTURAL RIGOR</div>
          <h2 className="section-title">Why Legal Practitioners Trust LexSphere™</h2>
          <p className="section-desc">
            Unlike generic generative AI, LexSphere™ enforces strict judicial ratio extraction and verifiable evidence.
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
            <h3 className="feature-title">Authoritative Indian Corpus</h3>
            <p className="feature-desc">
              Pre-loaded with foundational Indian jurisprudence including the Contract Act 1872, DPDP Act 2023, and Constitution Bench precedents.
            </p>
          </div>

          <div className="feature-item-card">
            <div className="feature-icon-wrapper">
              <FileCheck size={22} />
            </div>
            <h3 className="feature-title">Interactive Audit Trails</h3>
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

      {/* 3-Step Workflow */}
      <section className="home-section">
        <div className="section-header-center">
          <div className="section-eyebrow">HOW LEXSPHERE™ OPERATES</div>
          <h2 className="section-title">3-Step Grounded Research Workflow</h2>
        </div>

        <div className="workflow-steps-grid">
          <div className="workflow-step-card">
            <div className="workflow-step-num">01</div>
            <h3 className="workflow-step-title">Inquire</h3>
            <p className="workflow-step-desc">
              Enter a complex legal question, statutory interpretation inquiry, or doctrine analysis in natural language.
            </p>
          </div>

          <div className="workflow-step-card">
            <div className="workflow-step-num">02</div>
            <h3 className="workflow-step-title">Ground</h3>
            <p className="workflow-step-desc">
              The system identifies exact relevant statutory sections and judicial paragraphs across the 5 verified documents.
            </p>
          </div>

          <div className="workflow-step-card">
            <div className="workflow-step-num">03</div>
            <h3 className="workflow-step-title">Verify</h3>
            <p className="workflow-step-desc">
              Independent propositional validation generates an evidence audit with deep-linked citations and zero hallucinations.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="home-cta-banner">
        <div className="cta-banner-content">
          <h2 className="cta-banner-title">
            Start Your Verifiable Legal Research Today
          </h2>
          <p className="cta-banner-desc">
            Explore {documents.length || 5} curated landmark Indian judgments and statutory codes with instant citation verification.
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
