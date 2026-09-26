"""
PDF Processing Module for LexSphere Citation Verification System.
Extracts full text, page numbers, document names, and metadata from judgment PDFs using PyMuPDF.
"""

import os
import sys
import site
import json

# Ensure user site-packages are accessible
user_site = site.getusersitepackages()
if user_site not in sys.path:
    sys.path.insert(0, user_site)

try:
    import pymupdf as fitz
except ImportError:
    import fitz


def get_default_pdf_dir():
    """Resolve default PDF judgments directory path."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    rel_path = os.path.abspath(os.path.join(current_dir, "..", "..", "public", "documents", "judgments"))
    if os.path.exists(rel_path):
        return rel_path
    
    root_path = os.path.abspath(os.path.join(current_dir, "..", ".."))
    public_path = os.path.join(root_path, "public", "documents", "judgments")
    return public_path


def get_default_output_dir():
    """Resolve default extracted text output directory."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(current_dir, "data", "extracted_text")
    os.makedirs(output_dir, exist_ok=True)
    return output_dir


def extract_text_from_single_pdf(pdf_path: str) -> list:
    """
    Extract text and metadata page-by-page from a single PDF document.
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")

    doc_name = os.path.basename(pdf_path)
    pages_data = []

    try:
        doc = fitz.open(pdf_path)
        meta = doc.metadata or {}
        total_pages = len(doc)

        for page_num in range(total_pages):
            page = doc.load_page(page_num)
            page_text = page.get_text("text") or ""
            
            pages_data.append({
                "document": doc_name,
                "page": page_num + 1,
                "text": page_text.strip(),
                "metadata": {
                    "title": meta.get("title") or doc_name,
                    "author": meta.get("author") or "",
                    "creationDate": meta.get("creationDate") or "",
                    "total_pages": total_pages,
                    "file_size": os.path.getsize(pdf_path)
                }
            })
        doc.close()
    except Exception as e:
        print(f"Error processing PDF {pdf_path}: {e}")

    return pages_data


def process_all_pdfs(pdf_dir: str = None, output_dir: str = None) -> list:
    """
    Read all PDFs from judgment directory, extract text & metadata, and save extracted JSON.
    """
    if pdf_dir is None:
        pdf_dir = get_default_pdf_dir()
    if output_dir is None:
        output_dir = get_default_output_dir()

    os.makedirs(output_dir, exist_ok=True)
    all_extracted_pages = []

    if not os.path.exists(pdf_dir):
        print(f"Warning: Judgment directory does not exist: {pdf_dir}")
        return []

    pdf_files = [f for f in os.listdir(pdf_dir) if f.lower().endswith(".pdf")]
    print(f"Found {len(pdf_files)} PDF documents in {pdf_dir}")

    for pdf_file in pdf_files:
        pdf_path = os.path.join(pdf_dir, pdf_file)
        pages_data = extract_text_from_single_pdf(pdf_path)
        all_extracted_pages.extend(pages_data)

        # Save individual extracted JSON
        doc_json_name = f"{os.path.splitext(pdf_file)[0]}_extracted.json"
        doc_json_path = os.path.join(output_dir, doc_json_name)
        with open(doc_json_path, "w", encoding="utf-8") as f:
            json.dump(pages_data, f, indent=2, ensure_ascii=False)

    # Save combined extracted text JSON
    combined_json_path = os.path.join(output_dir, "extracted_text.json")
    with open(combined_json_path, "w", encoding="utf-8") as f:
        json.dump(all_extracted_pages, f, indent=2, ensure_ascii=False)

    print(f"Total extracted pages: {len(all_extracted_pages)} across {len(pdf_files)} PDFs.")
    return all_extracted_pages


if __name__ == "__main__":
    process_all_pdfs()
