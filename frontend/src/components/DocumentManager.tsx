import React, { useRef, useState } from 'react';
import { 
  BookOpen, 
  UploadCloud, 
  Search, 
  CheckCircle2, 
  Clock, 
  Eye, 
  X
} from 'lucide-react';
import { useLegalResearch } from '../context/LegalResearchContext';
import { LegalDocument, DocumentStatus } from '../types/legal';

export const DocumentManager: React.FC = () => {
  const { 
    documents, 
    selectedDocIds, 
    toggleDocSelection, 
    selectAllDocs, 
    clearDocSelection,
    uploadDocument,
    openDocModal 
  } = useLegalResearch();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Commercial', 'Constitutional', 'Privacy'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadDocument(e.target.files[0], 'Uploaded Brief');
      e.target.value = '';
    }
  };

  // Filter documents by search and category
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.citation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.court.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === 'All') return matchesSearch;
    if (selectedCategory === 'Commercial') {
      return matchesSearch && (doc.category.includes('Contract') || doc.category.includes('Commercial'));
    }
    if (selectedCategory === 'Constitutional') {
      return matchesSearch && doc.category.includes('Constitutional');
    }
    if (selectedCategory === 'Privacy') {
      return matchesSearch && (doc.category.includes('Privacy') || doc.category.includes('Data'));
    }
    return matchesSearch;
  });

  const renderStatus = (status: DocumentStatus, progress: number) => {
    switch (status) {
      case 'ready':
        return (
          <span className="legal-pill legal-pill-verified" title="Indexed in BM25 & Dense vector index">
            <CheckCircle2 size={10} /> Indexed
          </span>
        );
      case 'ocr_processing':
      case 'chunking':
      case 'indexing':
        return (
          <span className="legal-pill legal-pill-partial" title={`${status} (${progress}%)`}>
            <Clock size={10} /> Ingesting ({progress}%)
          </span>
        );
      case 'error':
        return (
          <span className="legal-pill legal-pill-unverified">
            Error
          </span>
        );
      default:
        return (
          <span className="legal-pill legal-pill-notfound">
            Queued
          </span>
        );
    }
  };

  return (
    <aside className="docs-sidebar" aria-label="Legal Document Repository">
      {/* Header */}
      <div className="docs-sidebar-header">
        <h2 className="docs-header-title">
          <BookOpen size={16} style={{ color: 'var(--brand-leather)' }} />
          Legal Corpus
          <span className="docs-count-pill">{documents.length}</span>
        </h2>

        <button 
          type="button" 
          className="btn-ghost" 
          onClick={selectedDocIds.length === documents.length ? clearDocSelection : selectAllDocs}
          title={selectedDocIds.length === documents.length ? "Deselect all" : "Select all"}
          style={{ fontSize: '0.725rem', padding: '0.15rem 0.4rem' }}
        >
          {selectedDocIds.length === documents.length ? 'Deselect' : 'Select All'}
        </button>
      </div>

      {/* Compact Upload Bar */}
      <div className="upload-compact-bar">
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept=".pdf,.txt,.docx"
          onChange={handleFileChange}
        />
        <button
          type="button"
          className="btn-upload-compact"
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud size={14} />
          <span>Upload PDF Brief / Statute</span>
        </button>
      </div>

      {/* Search Filter Input */}
      <div className="docs-search-wrapper">
        <Search size={13} className="docs-search-icon" />
        <input
          type="text"
          className="docs-search-input"
          placeholder="Filter documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            type="button" 
            onClick={() => setSearchQuery('')}
            style={{ position: 'absolute', right: '0.5rem', color: 'var(--text-subtle)' }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Category Filter Tags */}
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

      {/* Document Cards */}
      <div className="docs-cards-list" role="list">
        {filteredDocs.map((doc: LegalDocument) => {
          const isSelected = selectedDocIds.includes(doc.id);
          const isProcessing = doc.status !== 'ready' && doc.status !== 'error';

          return (
            <div 
              key={doc.id} 
              className={`compact-doc-card ${isSelected ? 'selected-for-search' : ''}`}
              role="listitem"
              onClick={() => toggleDocSelection(doc.id)}
            >
              <div className="doc-card-main-row">
                <div className="doc-title-checkbox-group">
                  <input
                    type="checkbox"
                    id={`doc-check-${doc.id}`}
                    className="doc-select-checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleDocSelection(doc.id);
                    }}
                    aria-label={`Select ${doc.title}`}
                  />
                  <div>
                    <h3 className="compact-doc-title">{doc.title}</h3>
                    <div className="compact-doc-sub">
                      {doc.court} • {doc.date.split('-')[0]}
                    </div>
                  </div>
                </div>
                {renderStatus(doc.status, doc.processingProgress)}
              </div>

              {/* Progress bar if processing */}
              {isProcessing && (
                <div className="compact-progress-box">
                  <div className="progress-info-row">
                    <span>{doc.status.replace('_', ' ').toUpperCase()}</span>
                    <span>{doc.processingProgress}%</span>
                  </div>
                  <div className="progress-track">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${doc.processingProgress}%` }} 
                    />
                  </div>
                </div>
              )}

              {/* Bottom Metadata */}
              <div className="doc-card-meta-row">
                <div className="doc-card-stats">
                  <span>{doc.pagesCount} pp</span>
                  <span>•</span>
                  <span>{doc.chunksCount} chunks</span>
                </div>

                <button
                  type="button"
                  className="doc-inspect-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDocModal(doc);
                  }}
                >
                  <Eye size={11} /> Inspect
                </button>
              </div>
            </div>
          );
        })}

        {filteredDocs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No matching documents found.
          </div>
        )}
      </div>
    </aside>
  );
};
