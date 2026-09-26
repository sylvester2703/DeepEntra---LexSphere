/**
 * LexSphere API Client & Integration Layer
 * Unified access to FastAPI backend and offline demo adapters
 */

export { 
  apiServiceManager, 
  LiveFastApiAdapter, 
  DemoAdapter,
  API_BASE_URL,
  API_ENDPOINTS 
} from '../services/legalApiService';

export type {
  ILegalApiService,
  ResearchQueryRequest,
  ResearchQueryApiResponse,
  VerifyClaimRequest,
  VerifyClaimResponse
} from '../types/api';

export type {
  LegalDocument,
  ResearchAnswerResult,
  RetrievedPassage,
  CitationItem,
  CitationVerificationStatus,
  BackendHealthResponse,
  QueryFilters
} from '../types/legal';
