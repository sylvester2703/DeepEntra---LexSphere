import React from 'react';
import { Scale, Sparkles, ShieldCheck } from 'lucide-react';

export const LegalLoadingState: React.FC = () => {
  return (
    <div className="surface-card animate-fade-in" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', borderColor: 'var(--brand-leather)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', maxWidth: '460px', margin: '0 auto' }}>
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: 'var(--brand-leather-light)',
          border: '1.5px solid var(--border-medium)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--brand-leather)',
          animation: 'pulse 1.8s infinite ease-in-out'
        }}>
          <Scale size={26} strokeWidth={2} />
        </div>

        <div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            Analyzing Legal Corpus & Verifying Authorities...
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.5 }}>
            Synthesizing statutory provisions and cross-referencing judicial precedents from the verified legal corpus.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.25rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Sparkles size={13} style={{ color: 'var(--brand-leather)' }} />
            Grounded Synthesis
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--status-verified-text)' }}>
            <ShieldCheck size={13} />
            Independent Verification
          </span>
        </div>
      </div>
    </div>
  );
};
