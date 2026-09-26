import React from 'react';
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
              <span className="doc-viewer-label">Authority / Court</span>
              <span className="doc-viewer-val">{doc.court}</span>
            </div>
            <div className="doc-viewer-meta-item">
              <span className="doc-viewer-label">Year</span>
              <span className="doc-viewer-val">{doc.date}</span>
            </div>
            <div className="doc-viewer-meta-item">
              <span className="doc-viewer-label">Legal Category</span>
              <span className="doc-viewer-val">{doc.category}</span>
            </div>
            <div className="doc-viewer-meta-item">
              <span className="doc-viewer-label">Status</span>
              <span className="doc-viewer-val" style={{ color: 'var(--status-verified-text)', fontWeight: 600 }}>
                Verified Available
              </span>
            </div>
          </div>

          {/* Citation Context Callout if opened from a specific citation */}
          {citation && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--brand-leather)' }}>
                  Cited Passage Context (Page {citation.sourcePage}):
                </span>
                <span className={`legal-pill legal-pill-${citation.verificationStatus === 'verified' ? 'verified' : 'unverified'}`}>
                  {citation.verificationStatus === 'verified' ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                  {citation.verificationStatus === 'verified' ? 'Verified' : citation.verificationStatus === 'source_not_found' ? 'Source Not Found' : 'Not Verified'}
                </span>
              </div>
              <div className="doc-viewer-excerpt-highlight">
                <p>"{citation.sourceExcerpt}"</p>
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', background: 'var(--bg-surface-subtle)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-xs)' }}>
                <strong>Verification Evidence:</strong> {citation.verificationRationale}
              </div>
            </div>
          )}

          {/* Document Summary */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              Legal Summary & Ratio:
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, background: 'var(--bg-surface-subtle)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              {doc.summary}
            </p>
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
