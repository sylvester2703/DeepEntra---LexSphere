import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  BookMarked, 
  Filter
} from 'lucide-react';
import { useLegalResearch } from '../context/LegalResearchContext';
import { SAMPLE_RESEARCH_QUESTIONS } from '../services/demoData';

export const ResearchQueryInput: React.FC = () => {
  const { 
    isQuerying, 
    runQuery, 
    selectSampleQuestion, 
    activeQuestionId, 
    selectedDocIds,
    documents 
  } = useLegalResearch();

  const [queryText, setQueryText] = useState<string>(
    SAMPLE_RESEARCH_QUESTIONS[0]?.query || ''
  );
  const [selectedBenchmarkCat, setSelectedBenchmarkCat] = useState<string>('All');

  const benchmarkCategories = ['All', 'Contract Law', 'Constitutional Law', 'Privacy Law'];

  const filteredBenchmarks = SAMPLE_RESEARCH_QUESTIONS.filter(b => {
    if (selectedBenchmarkCat === 'All') return true;
    return b.category === selectedBenchmarkCat;
  });

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

  const handleBenchmarkSelect = (sampleId: string) => {
    const sample = SAMPLE_RESEARCH_QUESTIONS.find(s => s.id === sampleId);
    if (sample) {
      setQueryText(sample.query);
      selectSampleQuestion(sample);
    }
  };

  return (
    <div className="research-workspace" aria-label="Legal Research Query Workspace">
      {/* Benchmark Selector Bar */}
      <div className="benchmark-compact-bar">
        <div className="benchmark-left">
          <span className="benchmark-label">
            <BookMarked size={13} style={{ color: 'var(--brand-leather)' }} />
            Sample Questions:
          </span>

          <div className="benchmark-category-pills">
            {benchmarkCategories.map(cat => (
              <button
                key={cat}
                type="button"
                className={`benchmark-cat-btn ${selectedBenchmarkCat === cat ? 'active' : ''}`}
                onClick={() => setSelectedBenchmarkCat(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdown to Load Benchmark Query */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <select
            className="benchmark-dropdown-select"
            value={activeQuestionId || ''}
            onChange={(e) => handleBenchmarkSelect(e.target.value)}
            disabled={isQuerying}
            aria-label="Select benchmark question"
          >
            {filteredBenchmarks.map(sample => (
              <option key={sample.id} value={sample.id}>
                {sample.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Central Query Input Card */}
      <div className="query-card-container">
        <div className="query-card-top-row">
          <h2 className="query-title-text">
            Legal Question & Research Inquiry
          </h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {selectedDocIds.length > 0 ? (
              <span className="legal-pill legal-pill-verified">
                <Filter size={10} /> Filtered to {selectedDocIds.length} Selected Document(s)
              </span>
            ) : (
              <span className="legal-pill legal-pill-notfound">
                Searching All {documents.length || 5} Curated Legal Documents
              </span>
            )}
          </div>
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
                  <Sparkles size={14} className="animate-spin" />
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
