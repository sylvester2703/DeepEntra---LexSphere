import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  SlidersHorizontal, 
  ArrowRight, 
  BookMarked, 
  Filter,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useLegalResearch } from '../context/LegalResearchContext';
import { SAMPLE_RESEARCH_QUESTIONS, SampleLegalQuestion } from '../services/demoData';
import { SearchRetrievalMode } from '../types/legal';

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
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [searchMode, setSearchMode] = useState<SearchRetrievalMode>('hybrid');
  const [topK, setTopK] = useState<number>(5);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!queryText.trim() || isQuerying) return;
    runQuery(queryText, {
      searchMode,
      topK,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectSample = (sample: SampleLegalQuestion) => {
    setQueryText(sample.query);
    selectSampleQuestion(sample);
  };

  return (
    <div className="research-container" aria-label="Legal Research Query Interface">
      {/* Sample Benchmark Questions */}
      <div className="sample-questions-section">
        <div className="sample-section-label">
          <BookMarked size={13} style={{ color: 'var(--brand-amber)' }} />
          Curated Legal Research Benchmarks (Click to Run)
        </div>
        <div className="sample-grid">
          {SAMPLE_RESEARCH_QUESTIONS.map((sample) => {
            const isActive = activeQuestionId === sample.id;
            return (
              <button
                key={sample.id}
                type="button"
                className={`sample-btn ${isActive ? 'active-sample' : ''}`}
                style={isActive ? { borderColor: 'var(--brand-leather)', background: '#fdf7f0' } : {}}
                onClick={() => handleSelectSample(sample)}
                disabled={isQuerying}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="sample-category">{sample.category}</span>
                  {isActive && <Check size={12} style={{ color: 'var(--brand-leather)' }} />}
                </div>
                <span className="sample-title">{sample.title}</span>
                <span className="sample-preview">{sample.query}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Query Input Box */}
      <div className="query-card">
        <div className="query-card-header">
          <h2 className="query-card-title">
            <Search size={20} style={{ color: 'var(--brand-leather)' }} />
            Legal Research & Statutory Discovery
          </h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {selectedDocIds.length > 0 ? (
              <span className="legal-pill legal-pill-verified">
                <Filter size={11} /> Filtered to {selectedDocIds.length} Selected Doc(s)
              </span>
            ) : (
              <span className="legal-pill legal-pill-notfound">
                Searching All {documents.length} Indexed Corpus Docs
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="query-input-wrapper">
          <textarea
            className="research-textarea"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a legal research question, statutory interpretation inquiry, or case law precedent search..."
            rows={3}
            disabled={isQuerying}
            aria-label="Legal Research Question"
          />

          <div className="query-controls-row">
            <div className="query-options-left">
              <button
                type="button"
                className={`filter-pill-btn ${showAdvanced ? 'active' : ''}`}
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <SlidersHorizontal size={13} />
                Retrieval Pipeline Parameters
                {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>

              <span style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>
                Press <kbd style={{ padding: '0.1rem 0.35rem', background: 'var(--bg-surface-sand)', border: '1px solid var(--border-medium)', borderRadius: '3px', fontFamily: 'var(--font-mono)' }}>Ctrl + Enter</kbd> to analyze
              </span>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isQuerying || !queryText.trim()}
              title="Execute hybrid RAG retrieval, Ollama generation, and citation verification"
            >
              {isQuerying ? (
                <>
                  <Sparkles size={16} className="animate-pulse-subtle" />
                  Analyzing Legal Corpus...
                </>
              ) : (
                <>
                  <Search size={16} />
                  Analyze & Verify Claims
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>

          {/* Advanced Pipeline Parameter Drawer */}
          {showAdvanced && (
            <div className="advanced-filters-panel">
              <div className="filter-group">
                <label className="filter-label">Retrieval Architecture Mode</label>
                <select 
                  className="filter-select"
                  value={searchMode}
                  onChange={(e) => setSearchMode(e.target.value as SearchRetrievalMode)}
                  disabled={isQuerying}
                >
                  <option value="hybrid">Hybrid: BM25 Lexical + Dense Vector (Recommended)</option>
                  <option value="bm25">BM25 Sparse Lexical Only (Statutory Exact Match)</option>
                  <option value="semantic">Dense 768-dim Vector Embeddings Only</option>
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Top-K Passages to Local Llama</label>
                <select 
                  className="filter-select"
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value))}
                  disabled={isQuerying}
                >
                  <option value={3}>3 Passages (High Precision Context)</option>
                  <option value={5}>5 Passages (Balanced Comprehensive RAG)</option>
                  <option value={8}>8 Passages (Broad Precedent Exploration)</option>
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Target Generation LLM</label>
                <select className="filter-select" disabled>
                  <option>Llama 3 8B (Local Ollama via FastAPI)</option>
                </select>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
