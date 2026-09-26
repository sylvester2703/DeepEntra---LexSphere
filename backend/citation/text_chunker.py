"""
Text Chunker Module for LexSphere Citation Verification System.
Splits extracted judgment text into semantic passages (500-1000 characters/tokens) with overlap.
"""

import os
import re
import json

def derive_case_name_from_doc(doc_name: str) -> str:
    """Derive clean human-readable case name from PDF filename."""
    base = os.path.splitext(doc_name)[0]
    # Remove leading numeric prefixes like 04_
    base = re.sub(r'^\d+_', '', base)
    # Replace underscores with spaces
    clean = base.replace('_', ' ').strip().title()
    # Normalize vs / v
    clean = re.sub(r'\bVs\b', 'vs', clean)
    clean = re.sub(r'\bV\b', 'vs', clean)
    return clean


def chunk_single_page(page_item: dict, chunk_size: int = 800, overlap: int = 150) -> list:
    """
    Split a single document page into text chunks.
    """
    doc_name = page_item.get("document", "")
    page_num = page_item.get("page", 1)
    text = page_item.get("text", "")
    case_name = page_item.get("metadata", {}).get("title") or derive_case_name_from_doc(doc_name)

    if not text:
        return []

    # Clean text
    text_clean = re.sub(r'\s+', ' ', text).strip()
    chunks = []
    start = 0
    idx = 0

    while start < len(text_clean):
        end = min(start + chunk_size, len(text_clean))
        
        # Try to break at natural paragraph or sentence boundary if possible
        if end < len(text_clean):
            last_period = text_clean.rfind('. ', start, end)
            if last_period > start + chunk_size // 2:
                end = last_period + 1

        chunk_str = text_clean[start:end].strip()
        if len(chunk_str) > 30:  # Filter out trivial noise
            chunks.append({
                "chunk_id": f"{doc_name}_p{page_num}_c{idx}",
                "text": chunk_str,
                "document": doc_name,
                "page_number": page_num,
                "case_name": case_name
            })
            idx += 1

        if end >= len(text_clean):
            break
        start = end - overlap if (end - overlap) > start else end

    return chunks


def chunk_extracted_pages(extracted_pages: list, chunk_size: int = 800, overlap: int = 150) -> list:
    """
    Chunk all extracted pages across all judgment documents.
    """
    all_chunks = []
    for item in extracted_pages:
        page_chunks = chunk_single_page(item, chunk_size=chunk_size, overlap=overlap)
        all_chunks.extend(page_chunks)

    print(f"Generated {len(all_chunks)} text chunks from {len(extracted_pages)} pages.")
    return all_chunks


if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    extracted_path = os.path.join(current_dir, "data", "extracted_text", "extracted_text.json")
    if os.path.exists(extracted_path):
        with open(extracted_path, "r", encoding="utf-8") as f:
            pages = json.load(f)
        chunks = chunk_extracted_pages(pages)
        print(f"Sample chunk: {chunks[0] if chunks else 'None'}")
