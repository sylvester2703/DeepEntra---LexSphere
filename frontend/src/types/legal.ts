/**
 * LexSphere Core Legal Domain Types & Data Models
 * Designed for Person 3 (Frontend) & integration with Person 1 (RAG/Ollama) & Person 2 (Verification)
 */

export type DocumentStatus = 'queued' | 'ocr_processing' | 'chunking' | 'indexing' | 'ready' | 'error';

export type SearchRetrievalMode = 'hybrid' | 'bm25' | 'semantic';

export type CitationVerificationStatus = 
  | 'verified' 
  | 'partially_verified' 
  | 'unverified' 
  | 'source_not_found';

export type EntailmentType = 
  | 'direct_entailment' 
  | 'partial_support' 
  | 'unsupported_claim' 
  | 'contradiction'
  | 'missing_source';

export interface LegalDocument {
  id: string;
  title: string;
  citation: string;
  court: string;
  jurisdiction: string;
  date: string;
  category: string;
  fileName: string;
  fileSizeBytes: number;
  pagesCount: number;
  chunksCount: number;
  status: DocumentStatus;
  processingProgress: number; // 0 - 100
  processingMessage?: string;
  summary: string;
  pdfUrl?: string;
  createdAt: string;
}

export interface RetrievedPassage {
  id: string;
  documentId: string;
  documentTitle: string;
  citation: string;
  court: string;
  date: string;
  pageNumber: number;
  paragraphNumber?: string;
  excerpt: string;
  retrievalMethod: 'bm25' | 'dense' | 'hybrid_reranked';
  bm25Score?: number;
  denseScore?: number;
  combinedScore: number;
  matchedKeywords?: string[];
}

export interface CitationItem {
  id: string;
  marker: string; // e.g. "[1]", "[2]"
  claimText: string;
  sourceDocumentId: string;
  sourceDocumentTitle: string;
  sourcePage: number;
  sourceParagraph?: string;
  sourceExcerpt: string;
  verificationStatus: CitationVerificationStatus;
  confidenceScore: number; // 0.0 - 1.0
  verificationRationale: string;
  entailmentType: EntailmentType;
}

export interface PipelineMetadata {
  preprocessingTimeMs: number;
  retrievalStrategy: string;
  bm25CandidatesCount: number;
  semanticCandidatesCount: number;
  rerankedPassagesCount: number;
  ollamaModel: string;
  generationTimeMs: number;
  verificationTimeMs: number;
  totalLatencyMs: number;
  fusionMethod: string;
}

export interface ResearchAnswerResult {
  queryId: string;
  query: string;
  groundedAnswer: string;
  supportingPassages: RetrievedPassage[];
  citations: CitationItem[];
  pipelineMetadata: PipelineMetadata;
  timestamp: string;
}

export interface QueryFilters {
  jurisdiction?: string;
  court?: string;
  category?: string;
  yearStart?: number;
  yearEnd?: number;
  documentIds?: string[];
  searchMode?: SearchRetrievalMode;
  topK?: number;
}

export interface BackendHealthResponse {
  status: 'healthy' | 'degraded' | 'unreachable';
  service: string;
  version: string;
  ollama?: {
    status: 'connected' | 'offline';
    model: string;
    temperature?: number;
  };
  indexStatus?: {
    documentsCount: number;
    passagesCount: number;
    vectorDim: number;
  };
}
