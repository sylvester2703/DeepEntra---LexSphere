import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Eye, 
  ArrowRight, 
  Scale, 
  Search
} from 'lucide-react';
import { useLegalResearch } from '../../context/LegalResearchContext';
import { LegalDocument } from '../../types/legal';
import { SAMPLE_RESEARCH_QUESTIONS } from '../../services/demoData';

export const CorpusPage: React.FC = () => {
  const { 
    documents, 
    openDocModal, 
    toggleDocSelection, 
    setActiveNavPage,
    selectSampleQuestion 
  } = useLegalResearch();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Contract Law', 'Constitutional Law', 'Privacy Law'];

  const filteredDocs = documents.filter((doc) => {
    if (selectedCategory === 'All') return true;
    return doc.category === selectedCategory;
  });

  const handleSearchDocInWorkspace = (doc: LegalDocument) => {
    const sample = SAMPLE_RESEARCH_QUESTIONS.find(s => s.relatedDocIds.includes(doc.id));
    if (sample) {
      selectSampleQuestion(sample);
    } else {
      toggleDocSelection(doc.id);
    }
    setActiveNavPage('workspace');
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Page Header */}
      <section className="page-header-section">
        <div className="page-header-badge">
          <BookOpen size={14} style={{ color: 'var(--brand-gold)' }} />
          <span>VERIFIED INDIAN LEGAL CORPUS</span>
        </div>
        <h1 className="page-title">Curated Legal Documents & Statutes</h1>
        <p className="page-subtitle">
          Explore the landmark judicial decisions and statutory codes verified and indexed for citation grounding in LexSphere™.
        </p>
      </section>

      {/* Category Filter Pills */}
      <div className="corpus-filter-bar">
        <div className="corpus-filter-group">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`corpus-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <span className="corpus-total-count">
          Verified Statutory Codes & Judicial Rulings
        </span>
      </div>

      {/* Detailed Document Cards Grid */}
      <div className="corpus-cards-grid">
        {filteredDocs.map((doc: LegalDocument) => (
          <div key={doc.id} className="corpus-detail-card">
            <div className="corpus-card-header-row">
              <span className="corpus-category-pill">{doc.category}</span>
              <span className="corpus-verified-badge">
                <CheckCircle2 size={12} /> Verified Authority
              </span>
            </div>

            <h3 className="corpus-doc-title">{doc.title}</h3>

            <div className="corpus-meta-row">
              <span className="corpus-meta-item">
                <Scale size={12} /> {doc.court}
              </span>
              <span>•</span>
              <span className="corpus-meta-item">{doc.citation}</span>
              <span>•</span>
              <span className="corpus-meta-item">{doc.date}</span>
            </div>

            <p className="corpus-doc-summary">
              {doc.summary}
            </p>

            <div className="corpus-card-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => openDocModal(doc)}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                title="Inspect full legal summary and ratio"
              >
                <Eye size={13} />
                <span>View Legal Summary</span>
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={() => handleSearchDocInWorkspace(doc)}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
                title="Query this document in the Legal Research Workspace"
              >
                <Search size={13} />
                <span>Analyze in Workspace</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Corpus Verification Guarantee */}
      <section className="corpus-info-box">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div className="corpus-info-icon">
            <Scale size={24} style={{ color: 'var(--brand-leather)' }} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              100% Verifiable Source Grounding Guarantee
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.3rem', lineHeight: 1.55 }}>
              All legal corpus documents have been digitally processed, chunked with semantic legal boundaries, and paired with an independent propositional verification engine. Every response generated in the workspace links directly to verifiable text within these authorities.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
