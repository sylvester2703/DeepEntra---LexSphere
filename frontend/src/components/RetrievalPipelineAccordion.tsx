import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { useLegalResearch } from '../context/LegalResearchContext';

export const RetrievalPipelineAccordion: React.FC = () => {
  const { activeResearch } = useLegalResearch();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  if (!activeResearch) return null;

  const { pipelineMetadata } = activeResearch;

  return (
    <div className="pipeline-accordion-card" aria-label="Retrieval Pipeline Inspection">
      <button
        type="button"
        className="pipeline-accordion-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="pipeline-trigger-left">
          <Layers size={14} style={{ color: 'var(--brand-leather)' }} />
          <span>Retrieval Pipeline & Model Transparency</span>
          <span className="pipeline-metrics-badge">
            • {pipelineMetadata.totalLatencyMs} ms latency • {pipelineMetadata.ollamaModel.split(' ')[0]}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '0.725rem' }}>{isOpen ? 'Hide Details' : 'Show Breakdown'}</span>
          {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </div>
      </button>

      {isOpen && (
        <div className="pipeline-accordion-content">
          <div className="pipeline-steps-grid">
            <div className="pipeline-step-box">
              <span className="step-box-num">STEP 1</span>
              <span className="step-box-title">Query Preprocessing</span>
              <span className="step-box-desc">
                Legal tokenization, entity extraction, and synonym expansion ({pipelineMetadata.preprocessingTimeMs}ms).
              </span>
            </div>

            <div className="pipeline-step-box">
              <span className="step-box-num">STEP 2</span>
              <span className="step-box-title">Dual Hybrid Retrieval</span>
              <span className="step-box-desc">
                BM25 ({pipelineMetadata.bm25CandidatesCount} candidates) + Dense 768-dim vector embeddings ({pipelineMetadata.semanticCandidatesCount} candidates).
              </span>
            </div>

            <div className="pipeline-step-box">
              <span className="step-box-num">STEP 3</span>
              <span className="step-box-title">RRF & Cross-Encoder</span>
              <span className="step-box-desc">
                Reciprocal Rank Fusion reranks and passes top {pipelineMetadata.rerankedPassagesCount} passages into prompt context.
              </span>
            </div>

            <div className="pipeline-step-box">
              <span className="step-box-num">STEP 4</span>
              <span className="step-box-title">Llama 3 Generation</span>
              <span className="step-box-desc">
                Local Ollama instance produces grounded synthesis without hallucinated case law ({pipelineMetadata.generationTimeMs}ms).
              </span>
            </div>

            <div className="pipeline-step-box">
              <span className="step-box-num">STEP 5</span>
              <span className="step-box-title">Citation Verification</span>
              <span className="step-box-desc">
                Person 2 entailment engine validates claims against source excerpts ({pipelineMetadata.verificationTimeMs}ms).
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
