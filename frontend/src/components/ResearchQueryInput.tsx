import React, { useState, useRef } from 'react';
import { 
  Search, 
  Loader2, 
  ArrowRight, 
  BookMarked, 
  Filter, 
  BookOpen, 
  ChevronDown, 
  X, 
  CheckCircle2, 
  PanelLeftClose, 
  PanelLeftOpen, 
  CheckSquare, 
  Square,
  Eye
} from 'lucide-react';
import { useLegalResearch } from '../context/LegalResearchContext';
import { SAMPLE_RESEARCH_QUESTIONS } from '../services/demoData';
import { LegalDocument } from '../types/legal';

export const ResearchQueryInput: React.FC = () => {
  const { 
    isQuerying, 
    runQuery, 
    selectSampleQuestion, 
    activeQuestionId, 
    selectedDocIds, 
    documents,
    toggleDocSelection,
    selectAllDocs,
    clearDocSelection,
    openDocModal,
    isCorpusSidebarOpen,
    toggleCorpusSidebar
  } = useLegalResearch();

  const [queryText, setQueryText] = useState<string>(
    SAMPLE_RESEARCH_QUESTIONS[0]?.query || ''
  );
  const [selectedBenchmarkCat, setSelectedBenchmarkCat] = useState<string>('All');
  const [isAuthoritiesDropdownOpen, setIsAuthoritiesDropdownOpen] = useState<boolean>(false);
  const [dropdownCategory, setDropdownCategory] = useState<string>('All');
  const dropdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const benchmarkCategories = ['All', 'Contract Law', 'Constitutional Law', 'Privacy Law'];

  const filteredBenchmarks = SAMPLE_RESEARCH_QUESTIONS.filter(b => {
    if (selectedBenchmarkCat === 'All') return true;
    return b.category === selectedBenchmarkCat;
  });

  const filteredDropdownDocs = documents.filter(d => {
    if (dropdownCategory === 'All') return true;
    return d.category === dropdownCategory;
  });

  const handleMouseEnterDropdown = () => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
    setIsAuthoritiesDropdownOpen(true);
  };

  const handleMouseLeaveDropdown = () => {
    dropdownTimerRef.current = setTimeout(() => {
      setIsAuthoritiesDropdownOpen(false);
    }, 280);
  };

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

  const isAllSelected = documents.length > 0 && selectedDocIds.length === documents.length;
  const isAnySelected = selectedDocIds.length > 0;

  return (
    <div className="research-workspace" aria-label="Legal Research Query Workspace">
      {/* Benchmark Selector Bar */}
      <div className="benchmark-compact-bar">
        <div className="benchmark-left">
          <span className="benchmark-label">
            <BookMarked size={13} style={{ color: 'var(--brand-leather)' }} />
            Sample Inquiries:
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

        {/* Dropdown to Load Benchmark Query & Sidebar Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
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

          {/* Quick Sidebar Toggle to slide to the side */}
          <button
            type="button"
            className="btn-ghost"
            onClick={toggleCorpusSidebar}
            title={isCorpusSidebarOpen ? "Collapse Corpus Sidebar to the side" : "Expand Corpus Sidebar"}
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: 'var(--brand-leather)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            {isCorpusSidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
            <span>{isCorpusSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}</span>
          </button>
        </div>
      </div>

      {/* Central Query Input Card */}
      <div className="query-card-container">
        <div className="query-card-top-row">
          <h2 className="query-title-text">
            Legal Question & Research Inquiry
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Direct Option to Clear / Remove Corpus Filter */}
            {selectedDocIds.length > 0 ? (
              <button
                type="button"
                className="legal-pill legal-pill-verified"
                onClick={clearDocSelection}
                title="Click to remove authority filter and search entire corpus"
                style={{ cursor: 'pointer', border: '1px solid #bce3c8', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Filter size={10} />
                <span>Filtered ({selectedDocIds.length} Selected)</span>
                <X size={11} style={{ marginLeft: '2px', color: '#8c1e1a' }} />
              </button>
            ) : (
              <span className="legal-pill legal-pill-notfound">
                Searching Curated Legal Corpus
              </span>
            )}

            {/* Dropdown Type Corpus Selector that disappears on mouse leave */}
            <div 
              className="authorities-dropdown-container"
              onMouseEnter={handleMouseEnterDropdown}
              onMouseLeave={handleMouseLeaveDropdown}
            >
              <button
                type="button"
                className={`authorities-dropdown-btn ${isAuthoritiesDropdownOpen ? 'active' : ''}`}
                onClick={() => setIsAuthoritiesDropdownOpen(prev => !prev)}
                title="Select authorities from dropdown (Auto-closes when moving cursor away)"
              >
                <BookOpen size={13} />
                <span>Authorities</span>
                <ChevronDown size={11} />
              </button>

              {/* Flyout Dropdown Menu */}
              {isAuthoritiesDropdownOpen && (
                <div 
                  className="authorities-dropdown-menu"
                  onMouseEnter={handleMouseEnterDropdown}
                  onMouseLeave={handleMouseLeaveDropdown}
                  role="dialog"
                  aria-label="Legal Authorities Dropdown Menu"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.45rem' }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <BookOpen size={14} style={{ color: 'var(--brand-leather)' }} />
                      <span>Select Legal Authorities</span>
                    </div>

                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => setIsAuthoritiesDropdownOpen(false)}
                      style={{ padding: '0.15rem 0.3rem', fontSize: '0.7rem' }}
                    >
                      <X size={12} />
                    </button>
                  </div>

                  {/* Dropdown Quick Controls */}
                  <div className="docs-quick-controls">
                    <button
                      type="button"
                      className="docs-quick-btn"
                      onClick={isAllSelected ? clearDocSelection : selectAllDocs}
                    >
                      {isAllSelected ? <Square size={11} /> : <CheckSquare size={11} />}
                      <span>{isAllSelected ? 'Deselect All' : 'Select All'}</span>
                    </button>

                    {isAnySelected && (
                      <button
                        type="button"
                        className="docs-quick-btn danger"
                        onClick={clearDocSelection}
                      >
                        <X size={11} />
                        <span>Clear Filter</span>
                      </button>
                    )}
                  </div>

                  {/* Category Pills */}
                  <div className="category-filter-row" role="tablist">
                    {benchmarkCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={`cat-filter-btn ${dropdownCategory === cat ? 'active' : ''}`}
                        onClick={() => setDropdownCategory(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Compact Authorities List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '240px', overflowY: 'auto' }}>
                    {filteredDropdownDocs.map((doc: LegalDocument) => {
                      const isSelected = selectedDocIds.includes(doc.id);

                      return (
                        <div
                          key={doc.id}
                          className={`curated-doc-card ${isSelected ? 'selected-for-search' : ''}`}
                          style={{ padding: '0.55rem 0.75rem', gap: '0.25rem' }}
                          onClick={() => toggleDocSelection(doc.id)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleDocSelection(doc.id);
                                }}
                                style={{ accentColor: 'var(--brand-leather)', cursor: 'pointer' }}
                              />
                              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {doc.title}
                              </span>
                            </div>

                            <button
                              type="button"
                              className="btn-ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDocModal(doc);
                              }}
                              style={{ fontSize: '0.65rem', padding: '0.1rem 0.3rem', color: 'var(--brand-leather)' }}
                              title="View Document Summary"
                            >
                              <Eye size={10} /> View
                            </button>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.675rem', color: 'var(--text-muted)' }}>
                            <span>{doc.court} • {doc.date}</span>
                            <span style={{ color: 'var(--status-verified-text)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                              <CheckCircle2 size={10} /> Available
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
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
