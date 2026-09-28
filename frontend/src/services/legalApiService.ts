/**
 * LexSphere Legal API Service & Adapters
 * Unified interface supporting both:
 * 1. LiveFastApiAdapter (Person 1 RAG + Ollama & Person 2 Verification via FastAPI backend)
 * 2. DemoAdapter (Realistic, internally consistent offline legal research demo dataset)
 */

import { 
  LegalDocument, 
  ResearchAnswerResult, 
  BackendHealthResponse,
  QueryFilters,
  RetrievedPassage,
  CitationItem
} from '../types/legal';

import { 
  ILegalApiService, 
  ResearchQueryRequest, 
  ResearchQueryApiResponse,
  VerifyClaimRequest,
  VerifyClaimResponse,
  SimpleExplanation
} from '../types/api';

import { 
  DEMO_DOCUMENTS, 
  DEMO_RESEARCH_RESPONSES, 
  generateDynamicDemoAnswer 
} from './demoData';

// API Endpoints centralized in one place
export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  DOCUMENTS: '/api/documents',
  DOCUMENT_UPLOAD: '/api/documents/upload',
  DOCUMENT_DETAIL: (id: string) => `/api/documents/${encodeURIComponent(id)}`,
  RESEARCH_QUERY: '/api/research/query',
  VERIFY_CITATION: '/api/citations/verify',
  EXPLAIN_SIMPLY: '/api/research/explain',
} as const;

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Adapter 1: Live FastAPI Backend Client
 * Connects to the combined Person 1 & Person 2 backend running on VITE_API_BASE_URL.
 * Does NOT silently fall back to demo data on failure.
 */
export class LiveFastApiAdapter implements ILegalApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async checkHealth(): Promise<BackendHealthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.HEALTH}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(4000)
      });

      if (!response.ok) {
        return {
          status: 'degraded',
          service: 'lexsphere-backend',
          version: '0.1.0',
          ollama: { status: 'offline', model: 'unknown' }
        };
      }

      return await response.json();
    } catch (err) {
      return {
        status: 'unreachable',
        service: 'lexsphere-backend',
        version: '0.0.0',
        ollama: { status: 'offline', model: 'none' }
      };
    }
  }

  async getDocuments(): Promise<LegalDocument[]> {
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.DOCUMENTS}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch legal documents from live backend (${response.status}: ${response.statusText})`);
    }

    return await response.json();
  }

  async uploadDocument(file: File, category?: string): Promise<LegalDocument> {
    const formData = new FormData();
    formData.append('file', file);
    if (category) formData.append('category', category);

    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.DOCUMENT_UPLOAD}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Document upload failed on live backend (${response.status}: ${response.statusText})`);
    }

    return await response.json();
  }

  async getDocumentById(id: string): Promise<LegalDocument | null> {
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.DOCUMENT_DETAIL(id)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`Failed to fetch document ${id} (${response.status})`);
    }

    return await response.json();
  }

  async queryResearch(query: string, filters?: QueryFilters): Promise<ResearchAnswerResult> {
    const payload: ResearchQueryRequest = {
      query,
      document_ids: filters?.documentIds,
      filters: {
        jurisdiction: filters?.jurisdiction,
        court: filters?.court,
        category: filters?.category,
        year_start: filters?.yearStart,
        year_end: filters?.yearEnd,
      },
      search_mode: filters?.searchMode || 'hybrid',
      top_k: filters?.topK || 5,
    };

    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.RESEARCH_QUERY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Research query pipeline failed on live backend (${response.status}): ${errorText || response.statusText}`);
    }

    const data: ResearchQueryApiResponse = await response.json();

    // Map backend snake_case model to frontend typed models
    const supportingPassages: RetrievedPassage[] = (data.supporting_passages || []).map(p => ({
      id: p.id,
      documentId: p.document_id,
      documentTitle: p.document_title,
      citation: p.citation,
      court: p.court,
      date: p.date,
      pageNumber: p.page_number,
      paragraphNumber: p.paragraph_number,
      excerpt: p.excerpt,
      retrievalMethod: p.retrieval_method,
      bm25Score: p.bm25_score,
      denseScore: p.dense_score,
      combinedScore: p.combined_score,
      matchedKeywords: p.matched_keywords
    }));

    const citations: CitationItem[] = (data.citations || []).map(c => ({
      id: c.id,
      marker: c.marker,
      claimText: c.claim_text,
      sourceDocumentId: c.source_document_id,
      sourceDocumentTitle: c.source_document_title,
      sourcePage: c.source_page,
      sourceParagraph: c.source_paragraph,
      sourceExcerpt: c.source_excerpt,
      verificationStatus: c.verification_status,
      confidenceScore: c.confidence_score,
      verificationRationale: c.verification_rationale,
      entailmentType: c.entailment_type
    }));

    return {
      queryId: data.query_id,
      query: data.query,
      groundedAnswer: data.grounded_answer,
      supportingPassages,
      citations,
      pipelineMetadata: {
        preprocessingTimeMs: data.pipeline_metadata?.preprocessing_time_ms || 0,
        retrievalStrategy: data.pipeline_metadata?.retrieval_strategy || 'Hybrid (BM25 + Dense)',
        bm25CandidatesCount: data.pipeline_metadata?.bm25_candidates_count || 0,
        semanticCandidatesCount: data.pipeline_metadata?.semantic_candidates_count || 0,
        rerankedPassagesCount: data.pipeline_metadata?.reranked_passages_count || 0,
        ollamaModel: data.pipeline_metadata?.ollama_model || 'llama3:8b (Local Ollama via FastAPI)',
        generationTimeMs: data.pipeline_metadata?.generation_time_ms || 0,
        verificationTimeMs: data.pipeline_metadata?.verification_time_ms || 0,
        totalLatencyMs: data.pipeline_metadata?.total_latency_ms || 0,
        fusionMethod: data.pipeline_metadata?.fusion_method || 'Reciprocal Rank Fusion (RRF) + Cross-Encoder'
      },
      timestamp: new Date().toISOString()
    };
  }

  async verifyClaim(request: VerifyClaimRequest): Promise<VerifyClaimResponse> {
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.VERIFY_CITATION}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Citation verification service failed (${response.status})`);
    }

    return await response.json();
  }

  async explainSimply(result: ResearchAnswerResult): Promise<SimpleExplanation> {
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.EXPLAIN_SIMPLY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        query: result.query,
        answer: result.groundedAnswer,
        citations: result.citations.map(c => ({
          claim_text: c.claimText,
          source_document_title: c.sourceDocumentTitle
        }))
      })
    });

    if (!response.ok) {
      throw new Error(`Simple explanation service failed (${response.status})`);
    }

    const data = await response.json();
    return { explanation: data.explanation, method: data.method };
  }
}

/**
 * Adapter 2: Demo Mode Legal Research Adapter
 * Fully self-contained, realistic sample corpus & answer generator.
 * Simulates real document ingestion stages and pipeline latency.
 */
export class DemoAdapter implements ILegalApiService {
  private localDocs: LegalDocument[] = [...DEMO_DOCUMENTS];

  async checkHealth(): Promise<BackendHealthResponse> {
    await new Promise(r => setTimeout(r, 150));
    return {
      status: 'healthy',
      service: 'lexsphere-demo-mock-engine',
      version: '0.1.0-demo',
      ollama: {
        status: 'connected',
        model: 'llama3:8b (Simulated Local Instance)',
        temperature: 0.1
      },
      indexStatus: {
        documentsCount: this.localDocs.length,
        passagesCount: this.localDocs.reduce((acc, d) => acc + d.chunksCount, 0),
        vectorDim: 768
      }
    };
  }

  async getDocuments(): Promise<LegalDocument[]> {
    await new Promise(r => setTimeout(r, 200));
    return [...this.localDocs];
  }

  async uploadDocument(file: File, category: string = 'General Legal Brief'): Promise<LegalDocument> {
    // Generate new document with initial processing state
    const newDocId = `doc-custom-${Date.now()}`;
    const newDoc: LegalDocument = {
      id: newDocId,
      title: file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
      citation: `Matter of ${file.name.substring(0, 15)} (Uploaded)`,
      court: 'User Document Corpus',
      jurisdiction: 'India / General',
      date: new Date().toISOString().split('T')[0],
      category,
      fileName: file.name,
      fileSizeBytes: file.size,
      pagesCount: Math.max(1, Math.floor(file.size / 45000)),
      chunksCount: Math.max(3, Math.floor(file.size / 15000)),
      status: 'ocr_processing',
      processingProgress: 25,
      processingMessage: 'Extracting text layer and optical character recognition...',
      summary: `User provided legal document (${file.name}) scheduled for BM25 keyword and dense 768-dim embeddings.`,
      createdAt: new Date().toISOString()
    };

    this.localDocs = [newDoc, ...this.localDocs];
    return newDoc;
  }

  async getDocumentById(id: string): Promise<LegalDocument | null> {
    await new Promise(r => setTimeout(r, 100));
    const found = this.localDocs.find(d => d.id === id);
    return found ? { ...found } : null;
  }

  async queryResearch(query: string, _filters?: QueryFilters): Promise<ResearchAnswerResult> {
    // Realistic pipeline latency simulation (1.2s - 1.8s) to emulate local Ollama + RRF
    await new Promise(r => setTimeout(r, 1400));

    // Check pre-computed questions
    const qLower = query.toLowerCase();
    if (qLower.includes('liquidat') || qLower.includes('section 74') || qLower.includes('contract') || qLower.includes('earnest money')) {
      return { ...DEMO_RESEARCH_RESPONSES['q1'], query };
    }
    if (qLower.includes('dpdp') || qLower.includes('data protection') || qLower.includes('legitimate use') || qLower.includes('consent')) {
      return { ...DEMO_RESEARCH_RESPONSES['q2'], query };
    }
    if (qLower.includes('puttaswamy') || qLower.includes('privacy') || qLower.includes('proportionality')) {
      return { ...DEMO_RESEARCH_RESPONSES['q3'], query };
    }
    if (qLower.includes('kesavananda') || qLower.includes('basic structure') || qLower.includes('article 368')) {
      return { ...DEMO_RESEARCH_RESPONSES['q4'], query };
    }

    // Dynamic generation matching local document corpus
    return generateDynamicDemoAnswer(query, this.localDocs);
  }

  async verifyClaim(request: VerifyClaimRequest): Promise<VerifyClaimResponse> {
    await new Promise(r => setTimeout(r, 300));
    return {
      status: 'verified',
      confidence_score: 0.94,
      entailment_type: 'direct_entailment',
      rationale: `The claim "${request.claim.substring(0, 60)}..." is entailed by the provided source passage context.`
    };
  }

  async explainSimply(result: ResearchAnswerResult): Promise<SimpleExplanation> {
    await new Promise(r => setTimeout(r, 600));
    const points = result.citations.map(c => `- ${c.claimText}`).join('\n');
    return {
      explanation: points
        ? `In simple terms, here is what the court decisions say:\n\n${points}`
        : 'None of the documents in the demo collection deal with this question.',
      method: 'demo mode'
    };
  }
}

/**
 * Service Factory
 */
export class LegalApiServiceManager {
  private liveAdapter: LiveFastApiAdapter;
  private demoAdapter: DemoAdapter;
  private currentMode: 'demo' | 'live';

  constructor() {
    this.liveAdapter = new LiveFastApiAdapter();
    this.demoAdapter = new DemoAdapter();
    const envDefault = import.meta.env.VITE_DEFAULT_MODE || 'demo';
    this.currentMode = envDefault === 'live' ? 'live' : 'demo';
  }

  getMode(): 'demo' | 'live' {
    return this.currentMode;
  }

  setMode(mode: 'demo' | 'live'): void {
    this.currentMode = mode;
  }

  getService(): ILegalApiService {
    return this.currentMode === 'live' ? this.liveAdapter : this.demoAdapter;
  }
}

// Global Singleton Service
export const apiServiceManager = new LegalApiServiceManager();
