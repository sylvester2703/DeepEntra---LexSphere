import React from 'react';
import { Header } from './components/Header';
import { DocumentManager } from './components/DocumentManager';
import { ResearchQueryInput } from './components/ResearchQueryInput';
import { GroundedAnswerWorkspace } from './components/GroundedAnswerWorkspace';
import { LoadingPipelineSkeleton } from './components/LoadingPipelineSkeleton';
import { Footer } from './components/Footer';
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
import './styles/modal.css';
import './styles/footer.css';

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
      {/* Minimal Top Navigation */}
      <Header />

      {/* Main Legal Workspace */}
      <main className="main-content">
        <div className="workspace-grid">
          {/* Left Column: Fixed 5 Curated Legal Documents */}
          <DocumentManager />

          {/* Right Column: Focused Research Workspace */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Search Query Area with Benchmark Selector */}
            <ResearchQueryInput />

            {/* Error Banner (if Live API fails) */}
            {queryError && (
              <div className="surface-card animate-fade-in" style={{ padding: '1rem', borderColor: 'var(--status-unverified-border)', background: 'var(--status-unverified-bg)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <AlertCircle size={18} style={{ color: 'var(--status-unverified-dot)', marginTop: '0.1rem', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: 'var(--status-unverified-text)', fontSize: '0.875rem', fontWeight: 600 }}>
                      Backend Communication Error
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                      {queryError}
                    </p>
                    {activeMode === 'live' && (
                      <div style={{ marginTop: '0.6rem' }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => toggleMode('demo')}
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                        >
                          Switch to Demo Mode
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Live Execution Progress */}
            {isQuerying && (
              <LoadingPipelineSkeleton stage={pipelineStage} />
            )}

            {/* Active Research Synthesis & 3-Tab Workspace */}
            {!isQuerying && activeResearch && (
              <GroundedAnswerWorkspace />
            )}
          </div>
        </div>
      </main>

      {/* Product Footer */}
      <Footer />

      {/* Modals & Reference Lightboxes */}
      <DocumentViewerModal />
      <PipelineArchitectureModal />
      <BackendStatusModal />
    </div>
  );
};
