import { 
  LegalDocument, 
  ResearchAnswerResult, 
  BackendHealthResponse,
  QueryFilters,
  CitationVerificationStatus,
  EntailmentType
} from './legal';

export interface ResearchQueryRequest {
  query: string;
  document_ids?: string[];
  filters?: {
    jurisdiction?: string;
    court?: string;
    category?: string;
    year_start?: number;
    year_end?: number;
  };
  search_mode?: 'hybrid' | 'bm25' | 'semantic';
  top_k?: number;
}

export interface ResearchQueryApiResponse {
  query_id: string;
  query: string;
  grounded_answer: string;
  supporting_passages: Array<{
    id: string;
    document_id: string;
    document_title: string;
    citation: string;
    court: string;
    date: string;
    page_number: number;
    paragraph_number?: string;
    excerpt: string;
    retrieval_method: 'bm25' | 'dense' | 'hybrid_reranked';
    bm25_score?: number;
    dense_score?: number;
    combined_score: number;
    matched_keywords?: string[];
  }>;
  citations: Array<{
    id: string;
    marker: string;
    claim_text: string;
    source_document_id: string;
    source_document_title: string;
    source_page: number;
    source_paragraph?: string;
    source_excerpt: string;
    verification_status: CitationVerificationStatus;
    confidence_score: number;
    verification_rationale: string;
    entailment_type: EntailmentType;
  }>;
  pipeline_metadata: {
    preprocessing_time_ms: number;
    retrieval_strategy: string;
    bm25_candidates_count: number;
    semantic_candidates_count: number;
    reranked_passages_count: number;
    ollama_model: string;
    generation_time_ms: number;
    verification_time_ms: number;
    total_latency_ms: number;
    fusion_method: string;
  };
}

export interface DocumentUploadResponse {
  document: LegalDocument;
  message: string;
}

export interface VerifyClaimRequest {
  claim: string;
  source_passage: string;
  citation_reference?: string;
}

export interface VerifyClaimResponse {
  status: CitationVerificationStatus;
  confidence_score: number;
  entailment_type: EntailmentType;
  rationale: string;
}

export interface SimpleExplanation {
  explanation: string;
  method: string; // how it was produced, e.g. "simplified by llama3.2:3b"
}

/**
 * Common service interface implemented by both DemoAdapter and LiveApiAdapter
 */
export interface ILegalApiService {
  checkHealth(): Promise<BackendHealthResponse>;
  getDocuments(): Promise<LegalDocument[]>;
  uploadDocument(file: File, category?: string): Promise<LegalDocument>;
  getDocumentById(id: string): Promise<LegalDocument | null>;
  queryResearch(query: string, filters?: QueryFilters): Promise<ResearchAnswerResult>;
  verifyClaim(request: VerifyClaimRequest): Promise<VerifyClaimResponse>;
  explainSimply(result: ResearchAnswerResult): Promise<SimpleExplanation>;
}
