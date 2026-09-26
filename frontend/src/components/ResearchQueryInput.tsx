import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  SlidersHorizontal, 
  ArrowRight, 
  BookMarked, 
  ChevronDown, 
  ChevronUp, 
  Filter 
} from 'lucide-react';
import { useLegalResearch } from '../context/LegalResearchContext';
import { SAMPLE_RESEARCH_QUESTIONS } from '../services/demoData';
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
  const [selectedBenchmarkCat, setSelectedBenchmarkCat] = useState<string>('All');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [searchMode, setSearchMode] = useState<SearchRetrievalMode>('hybrid');
  const [topK, setTopK] = useState<number>(5);

  const benchmarkCategories = ['All', 'Contract Law', 'Constitutional Law', 'Privacy Law'];

  const filteredBenchmarks = SAMPLE_RESEARCH_QUESTIONS.filter(b => {
    if (selectedBenchmarkCat === 'All') return true;
    if (selectedBenchmarkCat === 'Contract Law') return b.category.includes('Contract');
    if (selectedBenchmarkCat === 'Constitutional Law') return b.category.includes('Constitutional');
    if (selectedBenchmarkCat === 'Privacy Law') return b.category.includes('Privacy');
    return true;
  });

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!queryText.trim() || isQuerying) return;
    runQuery(queryText, { searchMode, topK });
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
    <div className="research-workspace" aria-label="Legal Research Query Interface">
      {/* Compact Benchmark Selector Bar */}
      <div className="benchmark-compact-bar">
        <div className="benchmark-left">
          <span className="benchmark-label">
            <BookMarked size={13} style={{ color: 'var(--brand-leather)' }} />
            Legal Benchmarks:
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

        {/* Compact Dropdown to Load Benchmark Query */}
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

      {/* Central Query Card */}
      <div className="query-card-container">
        <div className="query-card-top-row">
          <h2 className="query-title-text">
            Legal Question & Statutory Query
          </h2>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
            {selectedDocIds.length > 0 ? (
              <span className="legal-pill legal-pill-verified">
                <Filter size={10} /> Filtered to {selectedDocIds.length} Document(s)
              </span>
            ) : (
              <span className="legal-pill legal-pill-notfound">
                Searching All {documents.length} Corpus Documents
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <textarea
            className="query-textarea-box"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter legal research inquiry, statutory interpretation question, or precedent analysis..."
            rows={3}
            disabled={isQuerying}
            aria-label="Legal question input"
          />

          {/* Action Row */}
          <div className="query-actions-bar">
            <button
              type="button"
              className="advanced-toggle-btn"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <SlidersHorizontal size={12} />
              <span>Retrieval Configuration</span>
              {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            <button
              type="submit"
              className="btn-primary"
              disabled={isQuerying || !queryText.trim()}
              title="Execute RAG retrieval and citation verification"
            >
              {isQuerying ? (
                <>
                  <Sparkles size={15} className="animate-spin" />
                  Analyzing Legal Corpus...
                </>
              ) : (
                <>
                  <Search size={15} />
                  Analyze & Verify Claims
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>

          {/* Collapsible Advanced Retrieval Parameters (Hidden by default) */}
          {showAdvanced && (
            <div className="advanced-settings-drawer">
              <div className="setting-col">
                <label className="setting-label">Retrieval Mode</label>
                <select 
                  className="setting-select"
                  value={searchMode}
                  onChange={(e) => setSearchMode(e.target.value as SearchRetrievalMode)}
                  disabled={isQuerying}
                >
                  <option value="hybrid">Hybrid (BM25 + Dense Reranked)</option>
                  <option value="bm25">BM25 Sparse Lexical Only</option>
                  <option value="semantic">Dense Vector Embeddings Only</option>
                </select>
              </div>

              <div className="setting-col">
                <label className="setting-label">Passage Context Window (Top-K)</label>
                <select 
                  className="setting-select"
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value))}
                  disabled={isQuerying}
                >
                  <option value={3}>3 Passages (High Precision)</option>
                  <option value={5}>5 Passages (Balanced Standard)</option>
                  <option value={8}>8 Passages (Comprehensive)</option>
                </select>
              </div>

              <div className="setting-col">
                <label className="setting-label">Target Model</label>
                <select className="setting-select" disabled>
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
