import { 
  X, 
  Scale, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { useLegalResearch } from '../context/LegalResearchContext';

export const DocumentViewerModal: React.FC = () => {
  const { 
    selectedDocForModal, 
    selectedCitationForModal, 
    closeDocModal 
  } = useLegalResearch();

  if (!selectedDocForModal) return null;

  const doc = selectedDocForModal;
  const citation = selectedCitationForModal;

  return (
    <div className="modal-overlay" onClick={closeDocModal}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="doc-modal-title"
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Scale size={20} style={{ color: 'var(--brand-leather)' }} />
            <div>
              <h2 id="doc-modal-title" className="modal-title" style={{ fontSize: '1.15rem' }}>
                {doc.title}
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {doc.citation} • {doc.court}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={closeDocModal}
            aria-label="Close document viewer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Metadata Grid */}
          <div className="doc-viewer-meta">
            <div className="doc-viewer-meta-item">
              <span className="doc-viewer-label">Jurisdiction</span>
              <span className="doc-viewer-val">{doc.jurisdiction}</span>
            </div>
            <div className="doc-viewer-meta-item">
              <span className="doc-viewer-label">Date / Year</span>
              <span className="doc-viewer-val">{doc.date}</span>
            </div>
            <div className="doc-viewer-meta-item">
              <span className="doc-viewer-label">Category</span>
              <span className="doc-viewer-val">{doc.category}</span>
            </div>
            <div className="doc-viewer-meta-item">
              <span className="doc-viewer-label">Corpus Size</span>
              <span className="doc-viewer-val">{doc.pagesCount} Pages ({doc.chunksCount} Chunks)</span>
            </div>
          </div>

          {/* Citation Context Callout if opened from a specific citation */}
          {citation && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--brand-leather)' }}>
                  Cited Passage & Entailment Context (Page {citation.sourcePage}):
                </span>
                <span className={`legal-pill legal-pill-${citation.verificationStatus === 'verified' ? 'verified' : 'partial'}`}>
                  {citation.verificationStatus === 'verified' ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                  {citation.verificationStatus.replace('_', ' ').toUpperCase()} ({Math.round(citation.confidenceScore * 100)}%)
                </span>
              </div>
              <div className="doc-viewer-excerpt-highlight">
                <p>"{citation.sourceExcerpt}"</p>
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', background: 'var(--bg-surface-sand)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-xs)' }}>
                <strong>Verification Rationale:</strong> {citation.verificationRationale}
              </div>
            </div>
          )}

          {/* Document Summary */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              Executive Summary & Legal Ratio:
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, background: 'var(--bg-surface-subtle)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              {doc.summary}
            </p>
          </div>

          {/* Verbatim Document Page Inspection View */}
          <div className="doc-pages-preview">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Extracted Document Layer (Page {citation ? citation.sourcePage : 1} of {doc.pagesCount})
              </span>
              <span style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                File: {doc.fileName}
              </span>
            </div>

            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.925rem', lineHeight: 1.7, color: 'var(--text-primary)', padding: '0.5rem 0' }}>
              {citation ? (
                <div>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontStyle: 'italic' }}>
                    [...Preceding statutory and contextual arguments before the Bench...]
                  </p>
                  <p style={{ background: '#fdf3e2', padding: '0.6rem', borderLeft: '3px solid var(--brand-amber)', borderRadius: '2px' }}>
                    <strong>{citation.sourceParagraph || `Paragraph ${citation.sourcePage}`}:</strong> {citation.sourceExcerpt}
                  </p>
                  <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                    [...Following judicial directions and orders of the Court...]
                  </p>
                </div>
              ) : (
                <p>
                  {doc.summary} The statutory provisions and judicial ratios in this document have been parsed, segmented into semantic legal chunks, and indexed into both the BM25 lexical engine and the 768-dimensional dense vector space for rapid hybrid retrieval.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={closeDocModal}
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
