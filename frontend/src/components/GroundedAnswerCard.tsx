import React, { useState } from 'react';
import { 
  FileCheck, 
  Copy, 
  Check, 
  Layers, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  ExternalLink,
  Cpu
} from 'lucide-react';
import { useLegalResearch } from '../context/LegalResearchContext';

export const GroundedAnswerCard: React.FC = () => {
  const { 
    activeResearch, 
    highlightedCitationId, 
    setHighlightedCitationId, 
    setIsArchitectureModalOpen 
  } = useLegalResearch();

  const [copied, setCopied] = useState<boolean>(false);

  if (!activeResearch) return null;

  const { groundedAnswer, citations, pipelineMetadata } = activeResearch;

  // Compute counts
  const verifiedCount = citations.filter(c => c.verificationStatus === 'verified').length;
  const partialCount = citations.filter(c => c.verificationStatus === 'partially_verified').length;
  const unverifiedCount = citations.filter(c => c.verificationStatus === 'unverified').length;
  const notFoundCount = citations.filter(c => c.verificationStatus === 'source_not_found').length;

  const handleCopyAnswer = () => {
    navigator.clipboard.writeText(groundedAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCitationClick = (markerText: string) => {
    // Find matching citation item
    const matched = citations.find(c => c.marker === markerText.trim());
    if (matched) {
      setHighlightedCitationId(matched.id);
      // Smooth scroll to the citation card
      const element = document.getElementById(`citation-card-${matched.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  /**
   * Parse text and convert markers like [1], [2], [3] into interactive status-coded badge buttons
   */
  const renderFormattedAnswer = (text: string) => {
    const paragraphs = text.split('\n\n');

    return paragraphs.map((para, pIdx) => {
      // Split by citation pattern [1], [2], etc.
      const parts = para.split(/(\[\d+\])/g);

      return (
        <p key={pIdx}>
          {parts.map((part, idx) => {
            const isMarker = /^\[\d+\]$/.test(part.trim());
            if (isMarker) {
              const marker = part.trim();
              const citation = citations.find(c => c.marker === marker);
              const status = citation ? citation.verificationStatus : 'verified';
              const isHighlighted = citation && highlightedCitationId === citation.id;

              return (
                <button
                  key={idx}
                  type="button"
                  className={`inline-citation-badge ${status} ${isHighlighted ? 'active' : ''}`}
                  onClick={() => handleCitationClick(marker)}
                  title={
                    citation 
                      ? `${citation.marker} ${citation.sourceDocumentTitle} (Status: ${citation.verificationStatus.replace('_', ' ')}) - Click to inspect evidence`
                      : `Citation ${marker}`
                  }
                >
                  {marker}
                </button>
              );
            }

            // Regular text with support for bold **text** or *italic*
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
    <article className="answer-card" aria-label="Grounded Legal Research Answer">
      {/* Header */}
      <div className="answer-card-header">
        <div className="answer-header-left">
          <div className="answer-icon-badge">
            <FileCheck size={18} />
          </div>
          <div className="answer-title-group">
            <h3 className="answer-title">Grounded Legal Synthesis</h3>
            <span className="answer-subtitle">
              Generated via Local Llama (Ollama) & verified against retrieved passages
            </span>
          </div>
        </div>

        <div className="answer-header-actions">
          <button
            type="button"
            className="btn-action-tool"
            onClick={handleCopyAnswer}
            title="Copy answer text to clipboard"
          >
            {copied ? <Check size={13} style={{ color: '#165a2e' }} /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy Synthesis'}
          </button>

          <button
            type="button"
            className="btn-action-tool"
            onClick={() => setIsArchitectureModalOpen(true)}
            title="Inspect RAG & Verification pipeline stages"
          >
            <Layers size={13} />
            Pipeline Audit
          </button>
        </div>
      </div>

      {/* Verification Summary Ribbon */}
      <div className="verification-summary-bar">
        <div className="summary-stats-group">
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            Citation Entailment Breakdown:
          </span>
          <span className="stat-chip verified">
            <ShieldCheck size={13} /> {verifiedCount} Verified
          </span>
          {partialCount > 0 && (
            <span className="stat-chip partial">
              <AlertTriangle size={13} /> {partialCount} Partially Verified
            </span>
          )}
          {unverifiedCount > 0 && (
            <span className="stat-chip unverified">
              <AlertTriangle size={13} /> {unverifiedCount} Unverified
            </span>
          )}
          {notFoundCount > 0 && (
            <span className="stat-chip notfound">
              <HelpCircle size={13} /> {notFoundCount} Source Missing
            </span>
          )}
        </div>

        <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
          Click any citation chip <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>[#]</kbd> to jump to evidence
        </span>
      </div>

      {/* Editorial Body */}
      <div className="answer-body">
        {renderFormattedAnswer(groundedAnswer)}
      </div>

      {/* Footer */}
      <div className="answer-card-footer">
        <div className="model-attribution-pill">
          <Cpu size={13} />
          <span>Local Model: {pipelineMetadata.ollamaModel}</span>
          <span>•</span>
          <span>Latency: {pipelineMetadata.totalLatencyMs} ms</span>
        </div>

        <button
          type="button"
          className="pipeline-view-link"
          onClick={() => setIsArchitectureModalOpen(true)}
        >
          <span>View Retrieval & Verification Steps</span>
          <ExternalLink size={12} />
        </button>
      </div>
    </article>
  );
};
