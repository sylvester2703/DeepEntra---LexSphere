import React, { useState } from 'react';
import { 
  Search, 
  Loader2, 
  ArrowRight
} from 'lucide-react';
import { useLegalResearch } from '../context/LegalResearchContext';

export const ResearchQueryInput: React.FC = () => {
  const { 
    isQuerying, 
    runQuery
  } = useLegalResearch();

  const [queryText, setQueryText] = useState<string>('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!queryText.trim() || isQuerying) return;
    runQuery(queryText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="research-workspace" aria-label="Legal Research Query Workspace">
      {/* Central Query Input Card */}
      <div className="query-card-container">
        <div className="query-card-top-row">
          <h2 className="query-title-text">
            Legal Question & Research Inquiry
          </h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <textarea
            className="query-textarea-box"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a legal research inquiry, statutory interpretation question, or precedent analysis..."
            rows={3}
            disabled={isQuerying}
            aria-label="Legal question input"
          />

          {/* Action Row */}
          <div className="query-actions-bar">
            <span style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>
              Press <kbd style={{ padding: '0.1rem 0.35rem', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-light)', borderRadius: '3px', fontFamily: 'var(--font-mono)' }}>Ctrl + Enter</kbd> to analyze
            </span>

            <button
              type="submit"
              className="btn-primary"
              disabled={isQuerying || !queryText.trim()}
              title="Analyze question and verify legal citations"
            >
              {isQuerying ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Analyzing Legal Corpus...
                </>
              ) : (
                <>
                  <Search size={14} />
                  Analyze & Verify
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
