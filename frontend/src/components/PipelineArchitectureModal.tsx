import { 
  X, 
  Layers 
} from 'lucide-react';
import { useLegalResearch } from '../context/LegalResearchContext';

export const PipelineArchitectureModal: React.FC = () => {
  const { 
    isArchitectureModalOpen, 
    setIsArchitectureModalOpen, 
    activeResearch 
  } = useLegalResearch();

  if (!isArchitectureModalOpen) return null;

  const metadata = activeResearch?.pipelineMetadata;

  return (
    <div className="modal-overlay" onClick={() => setIsArchitectureModalOpen(false)}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '880px' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="architecture-modal-title"
      >
        <div className="modal-header">
          <h2 id="architecture-modal-title" className="modal-title">
            <Layers size={20} style={{ color: 'var(--brand-leather)' }} />
            LexSphere System Architecture & Pipeline Inspection
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={() => setIsArchitectureModalOpen(false)}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Active Query Latency & Candidate Metrics */}
          {metadata && (
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">Total Pipeline Latency</span>
                <span className="metric-value">{metadata.totalLatencyMs} ms</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">BM25 Sparse Candidates</span>
                <span className="metric-value">{metadata.bm25CandidatesCount} chunks</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Dense Vector Candidates</span>
                <span className="metric-value">{metadata.semanticCandidatesCount} chunks</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Reranked Top-K Injected</span>
                <span className="metric-value">{metadata.rerankedPassagesCount} passages</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Generation Model</span>
                <span className="metric-value" style={{ fontSize: '0.8rem' }}>{metadata.ollamaModel}</span>
              </div>
            </div>
          )}

          {/* 3-Person Team Architecture Distribution */}
          <div style={{ background: 'var(--bg-surface-sand)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--brand-leather)' }}>
              Hackathon Team Workstream Division:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.8rem' }}>
              <div style={{ background: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                <strong>Person 1 (RAG & Ollama):</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  BM25 + Dense retrieval, RRF fusion & cross-encoder reranking, prompt grounding with local Llama 3 via Ollama.
                </p>
              </div>
              <div style={{ background: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                <strong>Person 2 (Doc & Verification):</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Legal PDF parsing/OCR, legal chunking, entity extraction, and independent propositional entailment verifier.
                </p>
              </div>
              <div style={{ background: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                <strong>Person 3 (Frontend & Integration):</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  React + TS legal workspace, typed API client, demo/live adapters, interactive citation audit & evidence UI.
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Pipeline Steps */}
          <div className="pipeline-diagram">
            <div className="pipeline-step">
              <div className="step-number-circle active">1</div>
              <div className="step-card">
                <div className="step-header">
                  <span>Query Preprocessing & Intent Categorization</span>
                  <span className="step-badge">Person 1</span>
                </div>
                <p className="step-desc">
                  Expands statutory references (e.g. "Section 74 Contract Act", "DPDP legitimate use") and extracts legal entities.
                </p>
              </div>
            </div>

            <div className="pipeline-step">
              <div className="step-number-circle active">2</div>
              <div className="step-card">
                <div className="step-header">
                  <span>Parallel Hybrid Retrieval (BM25 + Dense Embeddings)</span>
                  <span className="step-badge">Person 1</span>
                </div>
                <p className="step-desc">
                  Retrieves keyword-exact statutory matches via BM25 while simultaneously querying dense 768-dim vector embeddings for conceptual precedent discovery.
                </p>
              </div>
            </div>

            <div className="pipeline-step">
              <div className="step-number-circle active">3</div>
              <div className="step-card">
                <div className="step-header">
                  <span>Reciprocal Rank Fusion (RRF) & Cross-Encoder Reranking</span>
                  <span className="step-badge">Person 1</span>
                </div>
                <p className="step-desc">
                  Fuses candidates using formula <code style={{ fontFamily: 'var(--font-mono)' }}>RRF(d) = Σ 1/(k + r(d))</code> and reranks top passages to guarantee optimal context for the LLM.
                </p>
              </div>
            </div>

            <div className="pipeline-step">
              <div className="step-number-circle active">4</div>
              <div className="step-card">
                <div className="step-header">
                  <span>Grounded Generation via Local Llama (Ollama)</span>
                  <span className="step-badge">Person 1 (Backend)</span>
                </div>
                <p className="step-desc">
                  FastAPI backend injects top reranked legal passages into a strictly constrained prompt template fed into a locally running Llama 3 instance via Ollama.
                </p>
              </div>
            </div>

            <div className="pipeline-step">
              <div className="step-number-circle active">5</div>
              <div className="step-card">
                <div className="step-header">
                  <span>Independent Citation Entailment Verification</span>
                  <span className="step-badge">Person 2</span>
                </div>
                <p className="step-desc">
                  Deconstructs the generated answer into atomic legal claims and checks whether each claim is strictly entailed by the source passage (Verified, Partially Verified, Unverified, or Missing Source).
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setIsArchitectureModalOpen(false)}
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
