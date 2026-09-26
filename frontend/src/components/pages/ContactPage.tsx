import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  HelpCircle,
  Building,
  ShieldCheck
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    firm: '',
    email: '',
    practiceArea: 'Corporate Litigation',
    inquiryType: 'Enterprise Deployment',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setSubmitted(true);
  };

  const faqs = [
    {
      q: 'How does LexSphere™ eliminate legal AI hallucinations?',
      a: 'LexSphere™ couples hybrid RAG with an independent Natural Language Inference (NLI) entailment engine (Person 2 module). Every generated proposition is cross-checked against verbatim source text before a citation badge is awarded.'
    },
    {
      q: 'What legal documents are currently indexed in the platform?',
      a: 'The current verified benchmark includes landmark authorities: Kailash Nath Associates v. DDA (2015), Indian Contract Act 1872, DPDP Act 2023, Justice K.S. Puttaswamy (2017), and Kesavananda Bharati (1973).'
    },
    {
      q: 'Can law firms deploy LexSphere™ completely on-premises?',
      a: 'Yes. LexSphere™ is architected to run alongside local Ollama instances (e.g. Llama 3) behind private FastAPI backends, guaranteeing that confidential legal briefs never leave your firm’s network.'
    },
    {
      q: 'How do lawyers inspect the verified source text?',
      a: 'Every answer contains interactive citation chips ([1], [2]). Clicking any chip instantly opens the Citation Verification audit tab, highlighting the exact judicial paragraph and rationale.'
    }
  ];

  return (
    <div className="page-container animate-fade-in">
      {/* Page Header */}
      <section className="page-header-section">
        <div className="page-header-badge">
          <Mail size={14} style={{ color: 'var(--brand-gold)' }} />
          <span>CONTACT & SUPPORT</span>
        </div>
        <h1 className="page-title">Contact LexSphere™ Legal Intelligence</h1>
        <p className="page-subtitle">
          Inquire about enterprise law firm deployments, judicial research partnerships, or technical integration with local LLM backends.
        </p>
      </section>

      {/* Main Grid: Form + Contact Info */}
      <div className="contact-main-grid">
        {/* Contact Form Card */}
        <div className="contact-form-card">
          <h2 className="contact-form-title">
            <Building size={18} style={{ color: 'var(--brand-leather)' }} />
            Legal Inquiry & Partnership Request
          </h2>
          <p className="contact-form-desc">
            Fill out the details below and our legal intelligence specialists will respond within 24 business hours.
          </p>

          {submitted ? (
            <div className="contact-success-state animate-fade-in">
              <div className="contact-success-icon">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="contact-success-title">Inquiry Successfully Transmitted</h3>
              <p className="contact-success-desc">
                Thank you, <strong>{formData.name}</strong>. Our legal technology team has received your inquiry for <strong>{formData.firm || 'your organization'}</strong> and will contact you at <strong>{formData.email}</strong> shortly.
              </p>
              <button
                type="button"
                className="btn-secondary"
                style={{ marginTop: '1rem' }}
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', firm: '', email: '', practiceArea: 'Corporate Litigation', inquiryType: 'Enterprise Deployment', message: '' });
                }}
              >
                Submit Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form-elements">
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-name">Full Name *</label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Adv. Rajesh Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="contact-firm">Law Firm / Institution</label>
                  <input
                    id="contact-firm"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Supreme Court Bar / Chambers"
                    value={formData.firm}
                    onChange={(e) => setFormData({ ...formData, firm: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-email">Professional Email *</label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    className="form-input"
                    placeholder="advocate@lawfirm.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="contact-practice">Primary Practice Area</label>
                  <select
                    id="contact-practice"
                    className="form-select"
                    value={formData.practiceArea}
                    onChange={(e) => setFormData({ ...formData, practiceArea: e.target.value })}
                  >
                    <option value="Corporate Litigation">Corporate & Commercial Litigation</option>
                    <option value="Constitutional Law">Constitutional & Appellate Practice</option>
                    <option value="Data Privacy">Data Privacy & Technology Law</option>
                    <option value="Contract Law">Contractual Arbitration</option>
                    <option value="Judicial Research">Judicial & Academic Research</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-type">Inquiry Type</label>
                <select
                  id="contact-type"
                  className="form-select"
                  value={formData.inquiryType}
                  onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                >
                  <option value="Enterprise Deployment">Law Firm On-Premise Deployment</option>
                  <option value="Research Partnership">Judicial Research & Academic Access</option>
                  <option value="API Integration">Live FastAPI Backend Integration</option>
                  <option value="General Inquiry">General Product Inquiry</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-message">Inquiry Details *</label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  className="form-textarea"
                  placeholder="Describe your legal workflow requirements, custom corpus needs, or technical queries..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ alignSelf: 'flex-start', padding: '0.65rem 1.4rem' }}
              >
                <Send size={14} />
                <span>Submit Legal Inquiry</span>
              </button>
            </form>
          )}
        </div>

        {/* Contact Information & Channels */}
        <div className="contact-info-col">
          <div className="contact-info-card">
            <h3 className="contact-info-heading">Direct Contact Channels</h3>

            <div className="contact-channel-item">
              <div className="channel-icon">
                <Mail size={16} />
              </div>
              <div>
                <span className="channel-title">Support & Partnerships</span>
                <a href="mailto:support@lexsphere.ai" className="channel-link">
                  support@lexsphere.ai
                </a>
              </div>
            </div>

            <div className="contact-channel-item">
              <div className="channel-icon">
                <Mail size={16} />
              </div>
              <div>
                <span className="channel-title">Legal & Compliance</span>
                <a href="mailto:legal@lexsphere.ai" className="channel-link">
                  legal@lexsphere.ai
                </a>
              </div>
            </div>

            <div className="contact-channel-item">
              <div className="channel-icon">
                <Phone size={16} />
              </div>
              <div>
                <span className="channel-title">Helpline (Toll-Free)</span>
                <span className="channel-text">+91 (11) 4920-5000 / +1 (800) 539-7743</span>
              </div>
            </div>

            <div className="contact-channel-item">
              <div className="channel-icon">
                <MapPin size={16} />
              </div>
              <div>
                <span className="channel-title">Corporate Headquarters</span>
                <span className="channel-text">
                  One Legal Plaza, Suite 400<br />
                  Legal AI Technology Park
                </span>
              </div>
            </div>
          </div>

          <div className="contact-guarantee-card">
            <ShieldCheck size={20} style={{ color: 'var(--status-verified-text)', flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Attorney-Client Privilege Safe
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.45 }}>
                Inquiries are encrypted and protected under strict confidentiality protocols. No client identities are ever shared or logged.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <section className="faq-section">
        <div className="section-header-center">
          <div className="section-eyebrow">KNOWLEDGE BASE</div>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-desc">
            Common questions regarding LexSphere™ citation verification, local models, and legal corpus management.
          </p>
        </div>

        <div className="faq-grid">
          {faqs.map((faq, idx) => (
            <div key={idx} className="faq-card">
              <div className="faq-q-row">
                <HelpCircle size={15} style={{ color: 'var(--brand-leather)', flexShrink: 0, marginTop: '0.15rem' }} />
                <h3 className="faq-question">{faq.q}</h3>
              </div>
              <p className="faq-answer">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
