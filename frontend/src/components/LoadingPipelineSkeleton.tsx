import { 
  Search, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { PipelineStage } from '../context/LegalResearchContext';

interface Props {
  stage: PipelineStage;
}

export const LoadingPipelineSkeleton: React.FC<Props> = ({ stage }) => {
  const steps = [
    {
      id: 'preprocessing',
      title: 'Query Preprocessing & Expansion',
      desc: 'Tokenizing legal terms, generating lexical synonyms & statute references',
      icon: Search
    },
    {
      id: 'retrieving',
      title: 'Dual Hybrid Retrieval (BM25 + Dense Vector Index)',
      desc: 'Executing parallel sparse BM25 lookup & 768-dim dense cosine similarity',
      icon: Layers
    },
    {
      id: 'reranking',
      title: 'Reciprocal Rank Fusion (RRF) & Cross-Encoder Reranking',
      desc: 'Scoring top passage candidates to synthesize optimal legal context window',
      icon: Layers
    },
    {
      id: 'generating',
      title: 'Grounded Generation via Local Llama 3 (Ollama)',
      desc: 'Injecting top passages into prompt template without hallucinated doctrine',
      icon: Cpu
    },
    {
      id: 'verifying',
      title: 'Independent Citation & Propositional Entailment Verification',
      desc: 'Person 2 module validates factual entailment against retrieved source text',
      icon: ShieldCheck
    }
  ];

  const getStepStatus = (stepId: string) => {
    const stageOrder = ['preprocessing', 'retrieving', 'reranking', 'generating', 'verifying', 'completed'];
    const currentIdx = stageOrder.indexOf(stage);
    const stepIdx = stageOrder.indexOf(stepId);

    if (currentIdx > stepIdx) return 'completed';
    if (currentIdx === stepIdx) return 'active';
    return 'pending';
  };

  return (
    <div className="query-card animate-fade-in" style={{ borderColor: 'var(--brand-leather)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <Loader2 size={20} className="animate-pulse-subtle" style={{ color: 'var(--brand-leather)' }} />
        <h3 className="legal-heading" style={{ fontSize: '1.1rem' }}>
          Executing Grounded Legal Research Pipeline...
        </h3>
      </div>

      <div className="pipeline-diagram">
        {steps.map((step, idx) => {
          const status = getStepStatus(step.id);
          const StepIcon = step.icon;

          return (
            <div key={step.id} className="pipeline-step">
              <div 
                className={`step-number-circle ${status === 'active' ? 'active' : ''}`}
                style={
                  status === 'completed' 
                    ? { background: 'var(--status-verified-bg)', borderColor: 'var(--status-verified-border)', color: 'var(--status-verified-text)' }
                    : status === 'active'
                      ? { background: 'var(--brand-leather)', borderColor: 'var(--brand-brass)', color: '#ffffff' }
                      : {}
                }
              >
                {status === 'completed' ? (
                  <CheckCircle2 size={16} />
                ) : status === 'active' ? (
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              <div 
                className="step-card" 
                style={status === 'active' ? { borderColor: 'var(--brand-leather)', background: '#fff9f4' } : {}}
              >
                <div className="step-header">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: status === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                    <StepIcon size={14} style={{ color: status === 'active' ? 'var(--brand-leather)' : 'inherit' }} />
                    {step.title}
                  </span>
                  <span className="step-badge">
                    {status === 'completed' ? 'Done' : status === 'active' ? 'Processing...' : 'Queued'}
                  </span>
                </div>
                <p className="step-desc">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
