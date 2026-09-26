import React, { useRef, useState } from 'react';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  Layers, 
  FileCode2, 
  Eye, 
  BookOpen
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
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCategory] = useState<string>('Contract & Commercial');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadDocument(e.target.files[0], selectedCategory);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadDocument(e.dataTransfer.files[0], selectedCategory);
    }
  };

  const renderStatusBadge = (status: DocumentStatus, progress: number) => {
    switch (status) {
      case 'ready':
        return (
          <span className="legal-pill legal-pill-verified" title="Indexed in BM25 and Vector Store">
            <CheckCircle2 size={11} /> Ready
          </span>
        );
      case 'ocr_processing':
        return (
          <span className="legal-pill legal-pill-partial" title={`OCR & Ingestion (${progress}%)`}>
            <Clock size={11} className="animate-pulse-subtle" /> OCR Ingest ({progress}%)
          </span>
        );
      case 'chunking':
        return (
          <span className="legal-pill legal-pill-partial" title={`Legal Chunking (${progress}%)`}>
            <Layers size={11} className="animate-pulse-subtle" /> Chunking ({progress}%)
          </span>
        );
      case 'indexing':
        return (
          <span className="legal-pill legal-pill-partial" title={`Dual Indexing (${progress}%)`}>
            <FileCode2 size={11} className="animate-pulse-subtle" /> Indexing ({progress}%)
          </span>
        );
      case 'error':
        return (
          <span className="legal-pill legal-pill-unverified">
            Failed
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
    <aside className="docs-panel" aria-label="Legal Document Repository">
      <div className="docs-panel-header">
        <h2 className="docs-panel-title">
          <BookOpen size={18} style={{ color: 'var(--brand-leather)' }} />
          Legal Corpus
          <span className="docs-count-badge">{documents.length}</span>
        </h2>

        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button 
            type="button" 
            className="btn-ghost" 
            onClick={selectedDocIds.length === documents.length ? clearDocSelection : selectAllDocs}
            title={selectedDocIds.length === documents.length ? "Deselect all" : "Select all for filtering"}
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem' }}
          >
            {selectedDocIds.length === documents.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      {/* PDF Upload Dropzone */}
      <div
        className={`upload-dropzone ${isDragging ? 'drag-active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload Legal PDF Brief or Statute"
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept=".pdf,.txt,.docx"
          onChange={handleFileChange}
        />
        <UploadCloud className="upload-icon" />
        <span className="upload-primary-text">Upload Legal Brief or Statute (PDF)</span>
        <span className="upload-sub-text">Automatic OCR, chunking & dual-indexing (BM25 + Dense)</span>
      </div>

      {/* Document Selection & Processing State List */}
      <div className="docs-list" role="list">
        {documents.map((doc: LegalDocument) => {
          const isSelected = selectedDocIds.includes(doc.id);
          const isProcessing = doc.status !== 'ready' && doc.status !== 'error';

          return (
            <div 
              key={doc.id} 
              className={`doc-card ${isSelected ? 'selected-for-query' : ''}`}
              role="listitem"
            >
              <div className="doc-card-top">
                <div className="doc-title-row">
                  <input
                    type="checkbox"
                    id={`doc-check-${doc.id}`}
                    className="doc-checkbox"
                    checked={isSelected}
                    onChange={() => toggleDocSelection(doc.id)}
                    aria-label={`Filter by ${doc.title}`}
                  />
                  <div>
                    <label htmlFor={`doc-check-${doc.id}`} className="doc-title" style={{ cursor: 'pointer' }}>
                      {doc.title}
                    </label>
                  </div>
                </div>
                {renderStatusBadge(doc.status, doc.processingProgress)}
              </div>

              {/* Ingestion Progress Bar if processing */}
              {isProcessing && (
                <div className="processing-container">
                  <div className="processing-header">
                    <span>{doc.status.replace('_', ' ').toUpperCase()}</span>
                    <span>{doc.processingProgress}%</span>
                  </div>
                  <div className="processing-bar-bg">
                    <div 
                      className="processing-bar-fill" 
                      style={{ width: `${doc.processingProgress}%` }} 
                    />
                  </div>
                  {doc.processingMessage && (
                    <span className="processing-message">{doc.processingMessage}</span>
                  )}
                </div>
              )}

              <div className="doc-meta-row">
                <span className="doc-category-badge">{doc.category}</span>
                <span className="doc-meta-item">
                  <FileText size={12} /> {doc.pagesCount} pp.
                </span>
                <span className="doc-meta-item">
                  <Layers size={12} /> {doc.chunksCount} chunks
                </span>
                <span className="doc-meta-item" style={{ fontFamily: 'var(--font-mono)' }}>
                  {doc.citation}
                </span>
              </div>

              <div className="doc-actions">
                <button
                  type="button"
                  className="btn-inspect-doc"
                  onClick={() => openDocModal(doc)}
                  title="Inspect document metadata, ratio and source excerpt"
                >
                  <Eye size={12} /> Inspect Source
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
