"""
Citation Verification Engine for LexSphere.
Validates generated legal text and citations against actual judgment database and FAISS vector index.
Prevents legal AI hallucinations and calculates verification confidence scores.
"""

import os
import re
import json
from vector_store import get_vector_store
from citation_parser import parse_citations_from_text


def load_known_citations_database():
    """Load extracted citations database if available."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    citations_file = os.path.join(current_dir, "data", "citations.json")
    if os.path.exists(citations_file):
        try:
            with open(citations_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return []


def normalize_str(s: str) -> str:
    """Normalize string for fuzzy/robust legal matching (normalizing v/vs/versus and removing punctuation)."""
    if not s:
        return ""
    # Standardize versus variations
    clean = re.sub(r'\b(versus|vs\.|vs|v\.)\b', ' v ', s, flags=re.IGNORECASE)
    # Strip non-alphanumeric
    clean = re.sub(r'[^a-z0-9]', '', clean.lower())
    return clean


def verify_legal_text_citations(input_text: str) -> dict:
    """
    Verify citations and claims inside an input legal text string.
    Returns structured verification results with status, confidence scores, and source passages.
    """
    if not input_text or not input_text.strip():
        return {
            "verification_status": "NOT_FOUND",
            "citations": [],
            "sources": [],
            "message": "Input text is empty."
        }

    # 1. Parse citations and case names from input text
    parsed_items = parse_citations_from_text(input_text)
    
    # 2. Get vector store instance & load known citations
    vector_store = get_vector_store()
    known_citations = load_known_citations_database()

    # 3. Search vector store using query text
    similar_chunks = vector_store.search_similar_chunks(input_text, top_k=5)

    verified_citations = []
    overall_statuses = []

    # Process each detected citation/case reference
    if parsed_items:
        for item in parsed_items:
            cite_str = item.get("citation", "")
            case_name = item.get("case_name", "")
            
            norm_cite = normalize_str(cite_str)
            norm_case = normalize_str(case_name)

            best_match = None
            max_sim = 0.0
            status = "NOT_FOUND"

            # Check FAISS similarity chunks for matching document/case
            for chunk in similar_chunks:
                chunk_text = chunk.get("text", "")
                chunk_case = chunk.get("case_name", "")
                chunk_doc = chunk.get("document", "")
                chunk_page = chunk.get("page_number", 1)
                score = chunk.get("similarity_score", 0.0)

                norm_chunk_text = normalize_str(chunk_text)
                norm_chunk_case = normalize_str(chunk_case)
                norm_doc_name = normalize_str(os.path.splitext(chunk_doc)[0])

                # Check exact or strong citation/case match
                is_cite_match = bool(norm_cite and (norm_cite in norm_chunk_text or norm_cite in norm_doc_name))
                is_case_match = bool(norm_case and (norm_case in norm_chunk_case or norm_chunk_case in norm_case or norm_case in norm_doc_name or norm_doc_name in norm_case))

                if (is_cite_match or is_case_match):
                    effective_score = max(score, 0.88 if (is_cite_match or is_case_match) else score)
                    if effective_score > max_sim:
                        max_sim = effective_score
                        best_match = {
                            "source_document": chunk_doc,
                            "page_number": chunk_page,
                            "matched_text": chunk_text,
                            "case_name": chunk_case or case_name or chunk_doc
                        }

            # Check known citations database as secondary check
            if not best_match:
                for db_cite in known_citations:
                    db_cite_str = db_cite.get("citation", "")
                    db_case_name = db_cite.get("case_name", "")
                    db_doc = db_cite.get("document", "")
                    db_page = db_cite.get("page", 1)
                    
                    norm_db_cite = normalize_str(db_cite_str)
                    norm_db_case = normalize_str(db_case_name)
                    norm_db_doc = normalize_str(os.path.splitext(db_doc)[0])

                    is_db_cite_match = bool(norm_cite and (norm_cite in norm_db_cite or norm_db_cite in norm_cite or norm_cite in norm_db_doc))
                    is_db_case_match = bool(norm_case and (norm_case in norm_db_case or norm_db_case in norm_case or norm_case in norm_db_doc or norm_db_doc in norm_case))

                    if is_db_cite_match or is_db_case_match:
                        best_match = {
                            "source_document": db_doc,
                            "page_number": db_page,
                            "matched_text": db_cite.get("surrounding_text", ""),
                            "case_name": db_case_name or case_name or db_doc
                        }
                        max_sim = 0.90
                        break

            # Determine verification status
            if best_match and max_sim >= 0.55:
                status = "VERIFIED"
                is_verified = True
            elif best_match and max_sim >= 0.35:
                status = "PARTIALLY_VERIFIED"
                is_verified = True
            elif similar_chunks and similar_chunks[0].get("similarity_score", 0.0) >= 0.65:
                top_chunk = similar_chunks[0]
                status = "VERIFIED"
                is_verified = True
                best_match = {
                    "source_document": top_chunk.get("document", ""),
                    "page_number": top_chunk.get("page_number", 1),
                    "matched_text": top_chunk.get("text", ""),
                    "case_name": top_chunk.get("case_name", "")
                }
                max_sim = top_chunk.get("similarity_score", 0.0)
            else:
                status = "NOT_FOUND"
                is_verified = False

            overall_statuses.append(status)

            res_entry = {
                "verified": is_verified,
                "status": status,
                "citation": cite_str,
                "case_name": best_match["case_name"] if best_match else case_name,
                "source_document": best_match["source_document"] if best_match else None,
                "page_number": best_match["page_number"] if best_match else None,
                "confidence_score": round(max_sim, 2) if max_sim > 0 else 0.0,
                "matched_text": best_match["matched_text"] if best_match else None
            }
            verified_citations.append(res_entry)

    else:
        # No formal citation extracted, evaluate semantic retrieval similarity
        if similar_chunks and len(similar_chunks) > 0:
            top_chunk = similar_chunks[0]
            score = top_chunk.get("similarity_score", 0.0)
            if score >= 0.60:
                status = "VERIFIED"
            elif score >= 0.40:
                status = "PARTIALLY_VERIFIED"
            else:
                status = "NOT_FOUND"

            overall_statuses.append(status)
            verified_citations.append({
                "verified": status in ["VERIFIED", "PARTIALLY_VERIFIED"],
                "status": status,
                "citation": "Semantic Retrieval Match",
                "case_name": top_chunk.get("case_name", ""),
                "source_document": top_chunk.get("document", ""),
                "page_number": top_chunk.get("page_number", 1),
                "confidence_score": round(score, 2),
                "matched_text": top_chunk.get("text", "")
            })

    # Final overall status calculation
    if "VERIFIED" in overall_statuses:
        final_status = "VERIFIED"
    elif "PARTIALLY_VERIFIED" in overall_statuses:
        final_status = "PARTIALLY_VERIFIED"
    else:
        final_status = "NOT_FOUND"

    return {
        "verification_status": final_status,
        "citations": verified_citations,
        "sources": [
            {
                "document": s.get("document"),
                "page": s.get("page_number"),
                "case_name": s.get("case_name"),
                "similarity": s.get("similarity_score")
            }
            for s in similar_chunks
        ]
    }


if __name__ == "__main__":
    sample_text = "According to Vidarbha Industries Power Limited vs Axis Bank Ltd (2022) 8 SCC 352..."
    result = verify_legal_text_citations(sample_text)
    print(json.dumps(result, indent=2))
