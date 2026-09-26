import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Eye 
} from 'lucide-react';
import { useLegalResearch } from '../context/LegalResearchContext';
import { LegalDocument } from '../types/legal';

export const DocumentManager: React.FC = () => {
  const { 
    documents, 
    selectedDocIds, 
    toggleDocSelection, 
    openDocModal 
  } = useLegalResearch();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Contract Law', 'Constitutional Law', 'Privacy Law'];

  const filteredDocs = documents.filter((doc) => {
    if (selectedCategory === 'All') return true;
    return doc.category === selectedCategory;
  });

  return (
    <aside className="docs-sidebar" aria-label="LexSphere Curated Legal Corpus">
      {/* Sidebar Header */}
      <div className="docs-sidebar-header">
        <div className="docs-header-title-row">
          <h2 className="docs-header-title">
            <BookOpen size={16} style={{ color: 'var(--brand-leather)' }} />
            Legal Corpus
          </h2>
        </div>
        <p className="docs-subtitle">
          Verified statutory codes & landmark judicial precedents
        </p>
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
