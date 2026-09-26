import React, { useState, useRef } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Eye, 
  PanelLeftClose, 
  PanelLeftOpen, 
  X, 
  CheckSquare, 
  Square,
  Maximize2
} from 'lucide-react';
import { useLegalResearch } from '../context/LegalResearchContext';
import { LegalDocument } from '../types/legal';

export const DocumentManager: React.FC = () => {
  const { 
    documents, 
    selectedDocIds, 
    toggleDocSelection, 
    selectAllDocs, 
    clearDocSelection, 
    openDocModal,
    isCorpusSidebarOpen,
    toggleCorpusSidebar
  } = useLegalResearch();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isFlyoutHovered, setIsFlyoutHovered] = useState<boolean>(false);
  const flyoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const categories = ['All', 'Contract Law', 'Constitutional Law', 'Privacy Law'];

  const filteredDocs = documents.filter((doc) => {
    if (selectedCategory === 'All') return true;
    return doc.category === selectedCategory;
  });

  const handleMouseEnterRail = () => {
    if (flyoutTimerRef.current) clearTimeout(flyoutTimerRef.current);
    setIsFlyoutHovered(true);
  };

  const handleMouseLeaveRail = () => {
    flyoutTimerRef.current = setTimeout(() => {
      setIsFlyoutHovered(false);
    }, 280);
  };

  const isAllSelected = documents.length > 0 && selectedDocIds.length === documents.length;
  const isAnySelected = selectedDocIds.length > 0;

  // -------------------------------------------------------------
  // Render Collapsed Slim Rail (When user collapsed sidebar)
  // -------------------------------------------------------------
  if (!isCorpusSidebarOpen) {
    return (
      <aside 
        className="docs-collapsed-rail" 
        aria-label="Collapsed Legal Corpus Rail"
        onMouseEnter={handleMouseEnterRail}
        onMouseLeave={handleMouseLeaveRail}
      >
        {/* Expand / Open Full Sidebar Button */}
        <button
          type="button"
          className="docs-rail-btn"
          onClick={toggleCorpusSidebar}
          title="Expand Legal Corpus Sidebar"
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen size={16} />
        </button>

        {/* Vertical Trigger Button for Flyout */}
        <div 
          style={{ position: 'relative', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem' }}
          onClick={() => setIsFlyoutHovered(prev => !prev)}
        >
          <div className="docs-rail-btn" title="Inspect Legal Corpus (Hover to view)">
            <BookOpen size={15} />
            {isAnySelected && <span className="docs-rail-badge" title="Authorities Selected" />}
          </div>
          <span className="docs-rail-vertical-text">
            Legal Corpus
          </span>
        </div>

        {/* Floating Flyout Popover that appears on hover / click and disappears on mouse leave */}
        {isFlyoutHovered && (
          <div 
            className="corpus-flyout-popover"
            onMouseEnter={handleMouseEnterRail}
            onMouseLeave={handleMouseLeaveRail}
            role="region"
            aria-label="Legal Corpus Flyout Menu"
          >
            <div className="corpus-flyout-header">
              <div className="corpus-flyout-title">
                <BookOpen size={15} style={{ color: 'var(--brand-leather)' }} />
                <span>Legal Corpus</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={toggleCorpusSidebar}
                  title="Pin sidebar open"
                  style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem', color: 'var(--brand-leather)' }}
                >
                  <Maximize2 size={12} /> Pin
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setIsFlyoutHovered(false)}
                  title="Close menu"
                  style={{ fontSize: '0.7rem', padding: '0.2rem 0.35rem' }}
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Quick Controls */}
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
                  title="Remove selection filter"
                >
                  <X size={11} />
                  <span>Clear Filter</span>
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="category-filter-row" role="tablist">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`cat-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Curated Document Cards */}
            <div className="docs-cards-list" role="list">
              {filteredDocs.map((doc: LegalDocument) => {
                const isSelected = selectedDocIds.includes(doc.id);

                return (
                  <div 
                    key={doc.id} 
                    className={`curated-doc-card ${isSelected ? 'selected-for-search' : ''}`}
                    role="listitem"
                    onClick={() => toggleDocSelection(doc.id)}
                  >
                    <div className="curated-card-top">
                      <div className="curated-title-group">
                        <input
                          type="checkbox"
                          id={`flyout-check-${doc.id}`}
                          className="curated-checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleDocSelection(doc.id);
                          }}
                          aria-label={`Select ${doc.title}`}
                        />
                        <h3 className="curated-doc-title">{doc.title}</h3>
                      </div>
                    </div>

                    <div className="curated-card-middle">
                      <div className="curated-court-year">
                        <span>{doc.court}</span>
                        <span>•</span>
                        <span>{doc.date}</span>
                      </div>

                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDocModal(doc);
                        }}
                        style={{ fontSize: '0.675rem', padding: '0.1rem 0.35rem', color: 'var(--brand-leather)' }}
                      >
                        <Eye size={11} /> View
                      </button>
                    </div>

                    <div className="curated-card-footer">
                      <span className="curated-category-tag">{doc.category}</span>
                      <span className="curated-status-tag">
                        <CheckCircle2 size={11} /> Available
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </aside>
    );
  }

  // -------------------------------------------------------------
  // Render Full Pinned Sidebar View
  // -------------------------------------------------------------
  return (
    <aside className="docs-sidebar" aria-label="LexSphere Curated Legal Corpus">
      {/* Sidebar Header with Collapse Button & Clear Filter */}
      <div className="docs-sidebar-header">
        <div className="docs-header-title-row">
          <h2 className="docs-header-title">
            <BookOpen size={16} style={{ color: 'var(--brand-leather)' }} />
            Legal Corpus
          </h2>

          <div className="docs-header-actions">
            {isAnySelected && (
              <button
                type="button"
                className="docs-quick-btn danger"
                onClick={clearDocSelection}
                title="Remove selection and search all corpus documents"
              >
                <X size={12} />
                <span>Clear Selection</span>
              </button>
            )}

            <button
              type="button"
              className="btn-ghost"
              onClick={toggleCorpusSidebar}
              title="Collapse Corpus Sidebar to the side"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.4rem', color: 'var(--text-muted)' }}
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose size={15} />
            </button>
          </div>
        </div>

        <p className="docs-subtitle">
          Verified statutory codes & landmark judicial precedents
        </p>
      </div>

      {/* Quick Select / Clear Controls */}
      <div className="docs-quick-controls">
        <button
          type="button"
          className="docs-quick-btn"
          onClick={isAllSelected ? clearDocSelection : selectAllDocs}
        >
          {isAllSelected ? <Square size={11} /> : <CheckSquare size={11} />}
          <span>{isAllSelected ? 'Deselect All' : 'Select All Authorities'}</span>
        </button>

        {isAnySelected && (
          <span style={{ fontSize: '0.7rem', color: 'var(--brand-leather)', fontWeight: 600 }}>
            {selectedDocIds.length} Selected
          </span>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="category-filter-row" role="tablist">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`cat-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Curated Document Cards */}
      <div className="docs-cards-list" role="list">
        {filteredDocs.map((doc: LegalDocument) => {
          const isSelected = selectedDocIds.includes(doc.id);

          return (
            <div 
              key={doc.id} 
              className={`curated-doc-card ${isSelected ? 'selected-for-search' : ''}`}
              role="listitem"
              onClick={() => toggleDocSelection(doc.id)}
            >
              <div className="curated-card-top">
                <div className="curated-title-group">
                  <input
                    type="checkbox"
                    id={`curated-check-${doc.id}`}
                    className="curated-checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleDocSelection(doc.id);
                    }}
                    aria-label={`Select ${doc.title}`}
                  />
                  <h3 className="curated-doc-title">{doc.title}</h3>
                </div>
              </div>

              <div className="curated-card-middle">
                <div className="curated-court-year">
                  <span>{doc.court}</span>
                  <span>•</span>
                  <span>{doc.date}</span>
                </div>

                <button
                  type="button"
                  className="btn-ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDocModal(doc);
                  }}
                  style={{ fontSize: '0.675rem', padding: '0.1rem 0.35rem', color: 'var(--brand-leather)' }}
                  title="Inspect legal document ratio"
                >
                  <Eye size={11} /> View
                </button>
              </div>

              <div className="curated-card-footer">
                <span className="curated-category-tag">{doc.category}</span>
                <span className="curated-status-tag">
                  <CheckCircle2 size={11} /> Available
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
