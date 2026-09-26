import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  LegalDocument, 
  ResearchAnswerResult, 
  BackendHealthResponse, 
  QueryFilters,
  CitationItem 
} from '../types/legal';
import { apiServiceManager } from '../services/legalApiService';
import { SAMPLE_RESEARCH_QUESTIONS, SampleLegalQuestion } from '../services/demoData';

export type PipelineStage = 
  | 'idle' 
  | 'preprocessing' 
  | 'retrieving' 
  | 'reranking' 
  | 'generating' 
  | 'verifying' 
  | 'completed';

interface LegalResearchContextType {
  documents: LegalDocument[];
  selectedDocIds: string[];
  activeMode: 'demo' | 'live';
  backendHealth: BackendHealthResponse | null;
  isQuerying: boolean;
  pipelineStage: PipelineStage;
  activeResearch: ResearchAnswerResult | null;
  activeQuestionId: string | null;
  highlightedCitationId: string | null;
  selectedDocForModal: LegalDocument | null;
  selectedCitationForModal: CitationItem | null;
  isArchitectureModalOpen: boolean;
  isBackendStatusModalOpen: boolean;
  queryError: string | null;
  
  // Actions
  toggleMode: (mode: 'demo' | 'live') => void;
  refreshHealth: () => Promise<void>;
  refreshDocuments: () => Promise<void>;
  uploadDocument: (file: File, category?: string) => Promise<void>;
  toggleDocSelection: (docId: string) => void;
  selectAllDocs: () => void;
  clearDocSelection: () => void;
  runQuery: (query: string, customFilters?: QueryFilters) => Promise<void>;
  selectSampleQuestion: (sample: SampleLegalQuestion) => void;
  setHighlightedCitationId: (id: string | null) => void;
  openDocModal: (doc: LegalDocument, citation?: CitationItem) => void;
  closeDocModal: () => void;
  setIsArchitectureModalOpen: (open: boolean) => void;
  setIsBackendStatusModalOpen: (open: boolean) => void;
}

const LegalResearchContext = createContext<LegalResearchContextType | undefined>(undefined);

export const LegalResearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeMode, setActiveMode] = useState<'demo' | 'live'>(apiServiceManager.getMode());
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [backendHealth, setBackendHealth] = useState<BackendHealthResponse | null>(null);
  
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('idle');
  const [activeResearch, setActiveResearch] = useState<ResearchAnswerResult | null>(null);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>('q1');
  const [highlightedCitationId, setHighlightedCitationId] = useState<string | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  // Modals
  const [selectedDocForModal, setSelectedDocForModal] = useState<LegalDocument | null>(null);
  const [selectedCitationForModal, setSelectedCitationForModal] = useState<CitationItem | null>(null);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState<boolean>(false);
  const [isBackendStatusModalOpen, setIsBackendStatusModalOpen] = useState<boolean>(false);

  const service = apiServiceManager.getService();

  // Refresh backend status
  const refreshHealth = useCallback(async () => {
    try {
      const health = await service.checkHealth();
      setBackendHealth(health);
    } catch {
      setBackendHealth({
        status: 'unreachable',
        service: 'lexsphere-backend',
        version: '0.0.0',
        ollama: { status: 'offline', model: 'none' }
      });
    }
  }, [service]);

  // Load documents
  const refreshDocuments = useCallback(async () => {
    try {
      const docs = await service.getDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error("Failed to load documents:", err);
    }
  }, [service]);

  // Initial load
  useEffect(() => {
    refreshHealth();
    refreshDocuments();
  }, [activeMode, refreshHealth, refreshDocuments]);

  // Toggle Demo vs Live mode
  const toggleMode = (mode: 'demo' | 'live') => {
    apiServiceManager.setMode(mode);
    setActiveMode(mode);
    setQueryError(null);
  };

  // Upload document
  const uploadDocument = async (file: File, category: string = 'General Legal Brief') => {
    try {
      const newDoc = await service.uploadDocument(file, category);
      setDocuments(prev => [newDoc, ...prev]);

      // If in demo mode, simulate gradual ingestion progression (Queued -> OCR -> Chunking -> Indexing -> Ready)
      if (activeMode === 'demo') {
        setTimeout(() => {
          setDocuments(prev => prev.map(d => d.id === newDoc.id ? { 
            ...d, 
            status: 'chunking', 
            processingProgress: 60,
            processingMessage: 'Semantic chunking & legal metadata extraction...'
          } : d));
        }, 1200);

        setTimeout(() => {
          setDocuments(prev => prev.map(d => d.id === newDoc.id ? { 
            ...d, 
            status: 'indexing', 
            processingProgress: 85,
            processingMessage: 'Building BM25 sparse index & generating dense embeddings...'
          } : d));
        }, 2400);

        setTimeout(() => {
          setDocuments(prev => prev.map(d => d.id === newDoc.id ? { 
            ...d, 
            status: 'ready', 
            processingProgress: 100,
            processingMessage: 'Document indexed and ready for hybrid legal discovery.'
          } : d));
        }, 3600);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      alert(`Upload error: ${message}`);
    }
  };

  // Toggle selection
  const toggleDocSelection = (docId: string) => {
    setSelectedDocIds(prev => 
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const selectAllDocs = () => {
    setSelectedDocIds(documents.map(d => d.id));
  };

  const clearDocSelection = () => {
    setSelectedDocIds([]);
  };

  // Run Research Query Pipeline
  const runQuery = async (queryText: string, customFilters?: QueryFilters) => {
    if (!queryText.trim()) return;

    setIsQuerying(true);
    setQueryError(null);
    setHighlightedCitationId(null);

    // Progressive pipeline visualizer stages
    setPipelineStage('preprocessing');

    const stepTimer1 = setTimeout(() => setPipelineStage('retrieving'), 250);
    const stepTimer2 = setTimeout(() => setPipelineStage('reranking'), 600);
    const stepTimer3 = setTimeout(() => setPipelineStage('generating'), 950);
    const stepTimer4 = setTimeout(() => setPipelineStage('verifying'), 1300);

    try {
      const filters: QueryFilters = {
        ...customFilters,
        documentIds: selectedDocIds.length > 0 ? selectedDocIds : undefined,
      };

      const result = await service.queryResearch(queryText, filters);
      
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      clearTimeout(stepTimer4);

      setPipelineStage('completed');
      setActiveResearch(result);
    } catch (err: unknown) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      clearTimeout(stepTimer4);

      setPipelineStage('idle');
      const message = err instanceof Error ? err.message : 'Unknown query execution error';
      setQueryError(message);
    } finally {
      setIsQuerying(false);
    }
  };

  // Select Sample Question
  const selectSampleQuestion = (sample: SampleLegalQuestion) => {
    setActiveQuestionId(sample.id);
    setSelectedDocIds(sample.relatedDocIds || []);
    runQuery(sample.query, { documentIds: sample.relatedDocIds });
  };

  // Load initial demo query on startup
  useEffect(() => {
    const defaultSample = SAMPLE_RESEARCH_QUESTIONS[0];
    if (defaultSample && !activeResearch && !isQuerying) {
      selectSampleQuestion(defaultSample);
    }
  }, []);

  // Modal actions
  const openDocModal = (doc: LegalDocument, citation?: CitationItem) => {
    setSelectedDocForModal(doc);
    setSelectedCitationForModal(citation || null);
  };

  const closeDocModal = () => {
    setSelectedDocForModal(null);
    setSelectedCitationForModal(null);
  };

  return (
    <LegalResearchContext.Provider
      value={{
        documents,
        selectedDocIds,
        activeMode,
        backendHealth,
        isQuerying,
        pipelineStage,
        activeResearch,
        activeQuestionId,
        highlightedCitationId,
        selectedDocForModal,
        selectedCitationForModal,
        isArchitectureModalOpen,
        isBackendStatusModalOpen,
        queryError,
        toggleMode,
        refreshHealth,
        refreshDocuments,
        uploadDocument,
        toggleDocSelection,
        selectAllDocs,
        clearDocSelection,
        runQuery,
        selectSampleQuestion,
        setHighlightedCitationId,
        openDocModal,
        closeDocModal,
        setIsArchitectureModalOpen,
        setIsBackendStatusModalOpen
      }}
    >
      {children}
    </LegalResearchContext.Provider>
  );
};

export const useLegalResearch = (): LegalResearchContextType => {
  const context = useContext(LegalResearchContext);
  if (!context) {
    throw new Error('useLegalResearch must be used within a LegalResearchProvider');
  }
  return context;
};
