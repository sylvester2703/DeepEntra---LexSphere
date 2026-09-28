import React, { useEffect, useState } from 'react';
import {
  FileCheck,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  Scale,
  MessageCircle,
  Loader2
} from 'lucide-react';
import { useLegalResearch } from '../context/LegalResearchContext';
import { apiServiceManager } from '../services/legalApiService';
import { CitationItem, CitationVerificationStatus } from '../types/legal';

interface SimpleExplanationState {
  queryId: string;
  text: string;
  method: string;
}

export const GroundedAnswerWorkspace: React.FC = () => {
  const { 
    activeResearch, 
    highlightedCitationId, 
    setHighlightedCitationId, 
    openDocModal, 
    documents 
  } = useLegalResearch();

  const [activeTab, setActiveTab] = useState<'analysis' | 'simple' | 'verification'>('analysis');
  const [copied, setCopied] = useState<boolean>(false);

  // Plain-language explanation: generated only when its tab is opened, cached per query
  const [simple, setSimple] = useState<SimpleExplanationState | null>(null);
  const [simpleLoading, setSimpleLoading] = useState<boolean>(false);
  const [simpleError, setSimpleError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab !== 'simple' || !activeResearch) return;
    if (simple?.queryId === activeResearch.queryId) return;
    let cancelled = false;
    setSimpleLoading(true);
    setSimpleError(null);
    apiServiceManager.getService().explainSimply(activeResearch)
      .then(res => {
        if (!cancelled) setSimple({ queryId: activeResearch.queryId, text: res.explanation, method: res.method });
      })
      .catch(err => {
        if (!cancelled) setSimpleError(err instanceof Error ? err.message : 'Could not create the explanation.');
      })
      .finally(() => {
        if (!cancelled) setSimpleLoading(false);
      });
    return () => { cancelled = true; };
  }, [activeTab, activeResearch, simple]);

  if (!activeResearch) return null;

  const { groundedAnswer, citations } = activeResearch;
  const simpleText = simple?.queryId === activeResearch.queryId ? simple.text : null;

  const verifiedCount = citations.filter(c => c.verificationStatus === 'verified').length;
  const partialCount = citations.filter(c => c.verificationStatus === 'partially_verified').length;
  const unverifiedCount = citations.filter(c => c.verificationStatus === 'unverified').length;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTab === 'simple' && simpleText ? simpleText : groundedAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCitationChipClick = (marker: string) => {
    const matched = citations.find(c => c.marker === marker.trim());
    if (matched) {
      setHighlightedCitationId(matched.id);
      setActiveTab('verification');
      setTimeout(() => {
        const el = document.getElementById(`audit-card-${matched.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  };

  const renderStatusPill = (status: CitationVerificationStatus) => {
    switch (status) {
      case 'verified':
        return (
          <span className="legal-pill legal-pill-verified">
            <CheckCircle2 size={11} /> Verified
          </span>
        );
      case 'partially_verified':
      case 'unverified':
        return (
          <span className="legal-pill legal-pill-unverified">
            <AlertTriangle size={11} /> Not Verified
          </span>
        );
      case 'source_not_found':
        return (
          <span className="legal-pill legal-pill-unverified">
            <AlertTriangle size={11} /> Source Not Found
          </span>
        );
    }
  };

  const handleOpenSource = (citation: CitationItem) => {
    const doc = documents.find(d => d.id === citation.sourceDocumentId);
    if (doc) {
      openDocModal(doc, citation);
    } else {
      openDocModal({
        id: citation.sourceDocumentId,
        title: citation.sourceDocumentTitle,
        citation: `Page ${citation.sourcePage}`,
        court: 'Cited Authority',
        jurisdiction: 'India',
        date: '2024',
        category: 'Legal Authority',
        fileName: `${citation.sourceDocumentTitle.replace(/\s+/g, '_')}.pdf`,
        fileSizeBytes: 1048576,
        pagesCount: citation.sourcePage + 5,
        chunksCount: 12,
        status: 'ready',
        processingProgress: 100,
        summary: `Supporting reference for citation ${citation.marker}`,
        createdAt: new Date().toISOString()
      }, citation);
    }
  };

  /**
   * Parse paragraphs and format inline citations as interactive chips
   */
  const renderFormattedAnswer = (text: string) => {
    // Each cited statement on its own line: break after a citation marker (or a run of
    // markers like "[1] [2]") whenever more text follows
    const lines = text
      .split('\n\n')
      .flatMap(para => para.split(/(?<=\])\s+(?=[^\s[])/g))
      .filter(line => line.trim());

    return lines.map((para, pIdx) => {
      const parts = para.split(/(\[\d+\])/g);

      return (
        <p key={pIdx} className="answer-citation-line">
          {parts.map((part, idx) => {
            const isMarker = /^\[\d+\]$/.test(part.trim());
            if (isMarker) {
              const marker = part.trim();
              const citation = citations.find(c => c.marker === marker);
              const status = citation ? citation.verificationStatus : 'verified';

              return (
                <button
                  key={idx}
                  type="button"
                  className={`citation-chip-btn ${status}`}
                  onClick={() => handleCitationChipClick(marker)}
                  title={citation ? `${citation.marker} ${citation.sourceDocumentTitle} (${citation.verificationStatus.replace('_', ' ')}) - Click to inspect verification` : marker}
                >
                  {marker}
                </button>
              );
            }

            const boldParts = part.split(/(\*\*.*?\*\*|\*.*?\*)/g);
            return (
              <span key={idx}>
                {boldParts.map((bPart, bIdx) => {
                  if (bPart.startsWith('**') && bPart.endsWith('**')) {
                    return <strong key={bIdx}>{bPart.slice(2, -2)}</strong>;
                  }
                  if (bPart.startsWith('*') && bPart.endsWith('*')) {
                    return <em key={bIdx}>{bPart.slice(1, -1)}</em>;
                  }
                  return bPart;
                })}
              </span>
            );
          })}
        </p>
      );
    });
  };

  return (
    <article className="response-workspace-card" aria-label="Legal Research Workspace">
      {/* Tab Switcher Header */}
      <div className="response-tabs-header">
        <div className="response-tabs-group" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'analysis'}
            className={`response-tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => setActiveTab('analysis')}
          >
            <FileCheck size={14} />
            <span>AI Legal Analysis</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'simple'}
            className={`response-tab-btn ${activeTab === 'simple' ? 'active' : ''}`}
            onClick={() => setActiveTab('simple')}
          >
            <MessageCircle size={14} />
            <span>Simple Explanation</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'verification'}
            className={`response-tab-btn ${activeTab === 'verification' ? 'active' : ''}`}
            onClick={() => setActiveTab('verification')}
          >
            <ShieldCheck size={14} />
            <span>Citation Verification</span>
            <span className="tab-badge-pill">{citations.length}</span>
          </button>
        </div>

        {/* Action Tools */}
        <div className="response-tab-actions">
          <button
            type="button"
            className="btn-tool-action"
            onClick={handleCopy}
            title="Copy answer text"
          >
            {copied ? <Check size={12} style={{ color: '#155e2e' }} /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : activeTab === 'simple' ? 'Copy Explanation' : 'Copy Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: AI Legal Analysis */}
      {activeTab === 'analysis' && (
        <div className="tab-content-container">
          <div className="editorial-answer-body">
            {renderFormattedAnswer(groundedAnswer)}
          </div>

          <div className="answer-summary-footer">
            <div className="citation-summary-badges">
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                Authority Status:
              </span>
              <span className="summary-stat-tag" style={{ color: 'var(--status-verified-text)' }}>
                <CheckCircle2 size={12} /> {verifiedCount} Verified Authorities
              </span>
              {(partialCount + unverifiedCount) > 0 && (
                <span className="summary-stat-tag" style={{ color: 'var(--status-unverified-text)' }}>
                  <AlertTriangle size={12} /> {partialCount + unverifiedCount} Not Verified
                </span>
              )}
            </div>

            <span style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>
              Click citation badge <kbd style={{ fontFamily: 'var(--font-mono)' }}>[#]</kbd> to inspect supporting legal text
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: Simple Explanation (everyday language) */}
      {activeTab === 'simple' && (
        <div className="tab-content-container">
          {simpleLoading && (
            <div className="simple-explanation-status">
              <Loader2 size={16} className="simple-explanation-spinner" />
              <span>Explaining the answer in simple words… this can take up to a minute.</span>
            </div>
          )}

          {simpleError && !simpleLoading && (
            <div className="simple-explanation-status simple-explanation-error">
              <AlertTriangle size={14} />
              <span>{simpleError}</span>
            </div>
          )}

          {simpleText && !simpleLoading && (
            <div className="editorial-answer-body">
              {simpleText.split('\n\n').map((para, idx) => (
                <p key={idx} style={{ whiteSpace: 'pre-line' }}>{para}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Citation Verification */}
      {activeTab === 'verification' && (
        <div className="tab-content-container">
          <div className="citations-audit-list" role="list">
            {citations.map((cit) => {
              const isTargeted = highlightedCitationId === cit.id;

              return (
                <div
                  key={cit.id}
                  id={`audit-card-${cit.id}`}
                  className={`citation-audit-card ${cit.verificationStatus} ${isTargeted ? 'target-highlighted' : ''}`}
                  role="listitem"
                >
                  <div className="audit-card-top-row">
                    <div className="audit-claim-group">
                      <span className="audit-marker-pill">{cit.marker}</span>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Legal Proposition:
                        </span>
                        <h4 className="audit-claim-heading">"{cit.claimText}"</h4>
                      </div>
                    </div>

                    <div className="audit-status-badge-group">
                      {renderStatusPill(cit.verificationStatus)}
                    </div>
                  </div>

                  {/* Supporting Source Excerpt */}
                  <div className="audit-source-block">
                    <div className="audit-source-header">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Scale size={12} />
                        {cit.sourceDocumentTitle} • Page {cit.sourcePage} {cit.sourceParagraph ? `(${cit.sourceParagraph})` : ''}
                      </span>
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => handleOpenSource(cit)}
                        style={{ fontSize: '0.7rem', padding: '0.1rem 0.35rem', color: 'var(--brand-leather)' }}
                      >
                        <ExternalLink size={10} /> Open Reference
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
};
