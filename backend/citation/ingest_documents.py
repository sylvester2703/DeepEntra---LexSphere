"""
Ingestion Pipeline for LexSphere Citation Verification System.
Executes the full automated build sequence:
PDFs -> Text Extraction -> Citation Parsing -> Text Chunking -> Embedding Generation -> FAISS Vector Store Indexing.
"""

import os
import sys
import site
import time

user_site = site.getusersitepackages()
if user_site not in sys.path:
    sys.path.insert(0, user_site)

from pdf_processor import process_all_pdfs, get_default_pdf_dir
from citation_parser import extract_all_citations
from text_chunker import chunk_extracted_pages
from embedding_generator import generate_embeddings_for_chunks, save_embeddings
from vector_store import LegalVectorStore


def run_ingestion_pipeline():
    """Execute end-to-end document ingestion and citation knowledge base creation."""
    start_time = time.time()
    print("=" * 60)
    print("STARTING LEXSPHERE CITATION VERIFICATION INGESTION PIPELINE")
    print("=" * 60)

    # Step 1: Text Extraction from PDFs
    print("\n--- STEP 1: PDF TEXT & METADATA EXTRACTION ---")
    pdf_dir = get_default_pdf_dir()
    print(f"Reading PDF judgments from: {pdf_dir}")
    extracted_pages = process_all_pdfs()

    if not extracted_pages:
        print("Error: No pages extracted. Please verify judgment PDF files are present.")
        sys.exit(1)

    # Step 2: Citation & Authority Extraction
    print("\n--- STEP 2: CITATION EXTRACTION & PARSING ---")
    citations = extract_all_citations(extracted_pages)

    # Step 3: Text Chunking
    print("\n--- STEP 3: SEMANTIC TEXT CHUNKING ---")
    chunks = chunk_extracted_pages(extracted_pages, chunk_size=800, overlap=150)

    # Step 4: Embedding Generation
    print("\n--- STEP 4: VECTOR EMBEDDING GENERATION ---")
    embeddings, chunks_with_meta = generate_embeddings_for_chunks(chunks)
    save_embeddings(embeddings, chunks_with_meta)

    # Step 5: FAISS Vector Index Creation
    print("\n--- STEP 5: FAISS VECTOR STORE INDEXING ---")
    vector_store = LegalVectorStore()
    vector_store.create_index(embeddings, chunks_with_meta)
    vector_store.save()

    elapsed = round(time.time() - start_time, 2)
    print("\n" + "=" * 60)
    print(f"SUCCESS: INGESTION PIPELINE COMPLETED IN {elapsed} SECONDS")
    print(f"- Processed Documents : {len(set(p['document'] for p in extracted_pages))}")
    print(f"- Extracted Pages     : {len(extracted_pages)}")
    print(f"- Extracted Citations : {len(citations)}")
    print(f"- Indexed Chunks      : {len(chunks_with_meta)}")
    print("=" * 60)


if __name__ == "__main__":
    run_ingestion_pipeline()
