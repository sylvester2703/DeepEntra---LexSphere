import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  CheckCircle2, 
  ExternalLink, 
  Layers, 
  FileText,
  Info,
  Scale
} from 'lucide-react';
import { useLegalResearch } from '../context/LegalResearchContext';
import { CitationItem, RetrievedPassage, CitationVerificationStatus } from '../types/legal';

export const CitationEvidenceList: React.FC = () => {
  const { 
    activeResearch, 
    highlightedCitationId, 
    setHighlightedCitationId, 
    openDocModal, 
    documents 
  } = useLegalResearch();

  const [activeTab, setActiveTab] = useState<'citations' | 'passages'>('citations');

  if (!activeResearch) return null;

  const { citations, supportingPassages } = activeResearch;

  const renderStatusPill = (status: CitationVerificationStatus) => {
    switch (status) {
      case 'verified':
        return (
          <span className="legal-pill legal-pill-verified">
            <CheckCircle2 size={12} /> Verified Entailment
          </span>
        );
      case 'partially_verified':
        return (
          <span className="legal-pill legal-pill-partial">
            <AlertTriangle size={12} /> Partially Verified
          </span>
        );
      case 'unverified':
        return (
          <span className="legal-pill legal-pill-unverified">
            <AlertTriangle size={12} /> Unverified / Mismatch
          </span>
        );
      case 'source_not_found':
        return (
          <span className="legal-pill legal-pill-notfound">
            <HelpCircle size={12} /> Source Not Found
          </span>
        );
    }
  };

  const handleOpenSource = (citation: CitationItem) => {
    const doc = documents.find(d => d.id === citation.sourceDocumentId);
    if (doc) {
      openDocModal(doc, citation);
    } else {
      // Fallback pseudo-document if not in standard list
      openDocModal({
        id: citation.sourceDocumentId,
        title: citation.sourceDocumentTitle,
        citation: `Source Ref p. ${citation.sourcePage}`,
        court: 'Cited Authority',
        jurisdiction: 'India',
        date: 'Precedent',
        category: 'Legal Precedent',
        fileName: `${citation.sourceDocumentTitle.replace(/\s+/g, '_')}.pdf`,
        fileSizeBytes: 1024000,
        pagesCount: citation.sourcePage + 5,
        chunksCount: 15,
        status: 'ready',
        processingProgress: 100,
        summary: `Retrieved supporting authority for citation ${citation.marker}`,
        createdAt: new Date().toISOString()
      }, citation);
    }
  };

  const handleOpenPassageSource = (passage: RetrievedPassage) => {
    const doc = documents.find(d => d.id === passage.documentId);
    if (doc) {
      openDocModal(doc);
    }
  };

  return (
    <section className="evidence-section" aria-label="Supporting Legal Evidence & Verification">
      {/* Evidence Section Tab Switcher */}
      <div className="evidence-header-tabs">
        <div className="tabs-group" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'citations'}
            className={`tab-btn ${activeTab === 'citations' ? 'active' : ''}`}
            onClick={() => setActiveTab('citations')}
          >
            <ShieldCheck size={16} />
            Citation Verification Results
            <span className="tab-count">{citations.length}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'passages'}
            className={`tab-btn ${activeTab === 'passages' ? 'active' : ''}`}
            onClick={() => setActiveTab('passages')}
          >
            <Layers size={16} />
            Retrieved Passages & RRF Scores
            <span className="tab-count">{supportingPassages.length}</span>
          </button>
        </div>

        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {activeTab === 'citations' 
            ? 'Independent propositional entailment verification' 
            : 'Hybrid BM25 + Dense vector passage ranking'
          }
        </span>
      </div>

      {/* Tab 1: Citation Verification Breakdown */}
      {activeTab === 'citations' && (
        <div className="citations-list" role="list">
          {citations.map((cit) => {
            const isHighlighted = highlightedCitationId === cit.id;

            return (
              <div
                key={cit.id}
                id={`citation-card-${cit.id}`}
                className={`citation-card ${cit.verificationStatus} ${isHighlighted ? 'highlighted-citation' : ''}`}
                role="listitem"
                onClick={() => setHighlightedCitationId(cit.id)}
              >
                {/* Top: Marker + Claim + Status */}
                <div className="citation-card-top">
                  <div className="claim-container">
                    <span className="marker-pill">{cit.marker}</span>
                    <div>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Asserted Claim in Synthesis:
                      </span>
                      <p className="claim-text">"{cit.claimText}"</p>
                    </div>
                  </div>

                  <div className="verification-badge-group">
                    {renderStatusPill(cit.verificationStatus)}
                    <span className="confidence-score" title="Entailment confidence score">
                      ({Math.round(cit.confidenceScore * 100)}% match)
                    </span>
                  </div>
                </div>

                {/* Supporting Source Excerpt */}
                <div className="excerpt-box">
                  <div className="excerpt-header">
                    <div className="excerpt-source-title">
                      <Scale size={13} />
                      <span>{cit.sourceDocumentTitle}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--text-muted)' }}>
                        • Page {cit.sourcePage} {cit.sourceParagraph ? `(${cit.sourceParagraph})` : ''}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn-inspect-doc"
                      onClick={(e) => { e.stopPropagation(); handleOpenSource(cit); }}
                      title="Open full source reference and surrounding text"
                    >
                      <ExternalLink size={12} /> Open Reference
                    </button>
                  </div>

                  <div className="excerpt-content">
                    "{cit.sourceExcerpt}"
                  </div>
                </div>

                {/* Verification Rationale (Semantic Entailment) */}
                <div className="rationale-box">
                  <Info size={14} className="rationale-icon" style={{ color: 'var(--brand-leather)' }} />
                  <div>
                    <strong style={{ color: 'var(--text-primary)', marginRight: '0.35rem' }}>
                      Verification Rationale:
                    </strong>
                    <span>{cit.verificationRationale}</span>
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="citation-card-footer">
                  <span>
                    Entailment Classification: <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--brand-leather)' }}>{cit.entailmentType}</code>
                  </span>
                  <span style={{ fontStyle: 'italic' }}>
                    Verified via Person 2 propositional entailment parser
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Retrieved Passages & Scores */}
      {activeTab === 'passages' && (
        <div className="passages-list" role="list">
          {supportingPassages.map((passage) => (
            <div key={passage.id} className="passage-card" role="listitem">
              <div className="passage-card-top">
                <div>
                  <h4 className="passage-title">{passage.documentTitle}</h4>
                  <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{passage.citation}</span>
                    <span>•</span>
                    <span>Page {passage.pageNumber}</span>
                    {passage.paragraphNumber && <span>• {passage.paragraphNumber}</span>}
                    <span>•</span>
                    <span>{passage.court}</span>
                  </div>
                </div>

                <div className="passage-scores-group">
                  <span className="score-badge combined" title="Combined Reciprocal Rank Fusion Score">
                    RRF Score: {passage.combinedScore.toFixed(3)}
                  </span>
                  {passage.bm25Score !== undefined && (
                    <span className="score-badge" title="BM25 Lexical Keyword Score">
                      BM25: {passage.bm25Score.toFixed(1)}
                    </span>
                  )}
                  {passage.denseScore !== undefined && (
                    <span className="score-badge" title="Dense Cosine Similarity Score">
                      Dense: {passage.denseScore.toFixed(3)}
                    </span>
                  )}
                </div>
              </div>

              {/* Matched Keywords */}
              {passage.matchedKeywords && passage.matchedKeywords.length > 0 && (
                <div className="keywords-tags-group">
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>BM25 Matched:</span>
                  {passage.matchedKeywords.map((kw, kIdx) => (
                    <span key={kIdx} className="keyword-tag">{kw}</span>
                  ))}
                </div>
              )}

              {/* Verbatim Excerpt */}
              <div className="excerpt-box" style={{ background: '#ffffff' }}>
                <p className="excerpt-content" style={{ fontStyle: 'normal', color: 'var(--text-primary)' }}>
                  "{passage.excerpt}"
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-inspect-doc"
                  onClick={() => handleOpenPassageSource(passage)}
                >
                  <FileText size={12} /> View Document In Context
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
