import React from 'react';
import { Header } from './components/Header';
import { DocumentManager } from './components/DocumentManager';
import { ResearchQueryInput } from './components/ResearchQueryInput';
import { GroundedAnswerCard } from './components/GroundedAnswerCard';
import { CitationEvidenceList } from './components/CitationEvidenceList';
import { LoadingPipelineSkeleton } from './components/LoadingPipelineSkeleton';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { PipelineArchitectureModal } from './components/PipelineArchitectureModal';
import { BackendStatusModal } from './components/BackendStatusModal';
import { useLegalResearch } from './context/LegalResearchContext';
import { AlertCircle } from 'lucide-react';
import './styles/global.css';
import './styles/header.css';
import './styles/documents.css';
import './styles/research.css';
import './styles/answer.css';
import './styles/evidence.css';
import './styles/pipeline.css';
import './styles/modal.css';

export const AppContent: React.FC = () => {
  const { 
    isQuerying, 
    pipelineStage, 
    activeResearch, 
    queryError, 
    toggleMode, 
    activeMode 
  } = useLegalResearch();

  return (
    <div className="app-layout">
      <Header />

      <main className="main-content">
        <div className="workspace-grid">
          {/* Left Column: Legal Documents & Ingestion State */}
          <DocumentManager />

          {/* Right Column: Research Workflow, Grounded Synthesis & Verification */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            <ResearchQueryInput />

            {/* Error Banner if live backend or query fails */}
            {queryError && (
              <div className="query-card animate-fade-in" style={{ borderColor: 'var(--status-unverified-pill)', background: '#fdf3f2' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <AlertCircle size={20} style={{ color: 'var(--status-unverified-pill)', marginTop: '0.1rem', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: 'var(--status-unverified-text)', fontSize: '0.95rem', fontWeight: 600 }}>
                      Query Pipeline Error
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      {queryError}
                    </p>
                    {activeMode === 'live' && (
                      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.6rem' }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => toggleMode('demo')}
                          style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                        >
                          Switch to Demo Mode
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Live Pipeline Execution Progress */}
            {isQuerying && (
              <LoadingPipelineSkeleton stage={pipelineStage} />
            )}

            {/* Grounded Synthesis & Citation Verification Results */}
            {!isQuerying && activeResearch && (
              <>
                <GroundedAnswerCard />
                <CitationEvidenceList />
              </>
            )}
          </div>
        </div>
      </main>

      {/* Global Modals & Lightboxes */}
      <DocumentViewerModal />
      <PipelineArchitectureModal />
      <BackendStatusModal />
    </div>
  );
};
