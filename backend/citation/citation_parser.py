"""
Citation Parser Module for LexSphere Citation Verification System.
Parses Indian legal citations, case names, and statutory authorities from judgment text.
"""

import os
import re
import json

# Regular expressions for Indian legal citations
CITATION_PATTERNS = [
    # E.g., (2022) 8 SCC 352, (2017) 10 SCC 1, (2023) 4 SCC 100
    r'\(\d{4}\)\s*\d+\s+SCC\s+\d+',
    # E.g., AIR 1978 SC 597, AIR 2023 SC 100
    r'AIR\s+\d{4}\s+SC\s+\d+',
    # E.g., 2023 SCC OnLine SC 352, 2023 SCC OnLine SC 123
    r'\d{4}\s+SCC\s+OnLine\s+[A-Za-z]+\s+\d+',
    # E.g., 2024 INSC 688, 2023 INSC 627, 2023 INSC 308
    r'\d{4}\s+INSC\s+\d+',
    # E.g., Criminal Appeal No. 1750 of 2023, Civil Appeal No. 10452 of 2024
    r'(?:Criminal|Civil)\s+Appeal\s+No\.\s*\d+\s+of\s+\d{4}',
    # E.g., 2023 SCC OnLine SC 352
    r'\d{4}\s+SCC\s+OnLine\s+[A-Z]+\s+\d+'
]

CASE_NAME_PATTERN = r'([A-Z][A-Za-z0-9\.\s@&]+?\s+(?:v\.|vs\.|versus|vs)\s+[A-Z][A-Za-z0-9\.\s\(\)]+)'


def parse_citations_from_text(text: str, document_name: str = "", page_number: int = 0) -> list:
    """
    Parse legal citations and case titles from text block.
    """
    found_citations = []
    if not text:
        return found_citations

    # 1. Match legal citation regexes
    for pattern in CITATION_PATTERNS:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            citation_str = match.group(0).strip()
            start_pos = max(0, match.start() - 150)
            end_pos = min(len(text), match.end() + 150)
            surrounding = text[start_pos:end_pos].replace("\n", " ").strip()
            
            # Extract potential case name in proximity
            case_name_match = re.search(CASE_NAME_PATTERN, text[max(0, match.start() - 250):min(len(text), match.end() + 250)], re.IGNORECASE)
            case_name = case_name_match.group(1).strip() if case_name_match else ""

            found_citations.append({
                "citation": citation_str,
                "case_name": case_name,
                "document": document_name,
                "page": page_number,
                "surrounding_text": surrounding
            })

    # 2. Also check case names directly if no formal citation matched
    if not found_citations:
        case_matches = re.finditer(CASE_NAME_PATTERN, text, re.IGNORECASE)
        for match in case_matches:
            case_name_str = match.group(1).strip()
            # Ignore short noise matches
            if len(case_name_str) > 10:
                start_pos = max(0, match.start() - 100)
                end_pos = min(len(text), match.end() + 100)
                found_citations.append({
                    "citation": case_name_str,
                    "case_name": case_name_str,
                    "document": document_name,
                    "page": page_number,
                    "surrounding_text": text[start_pos:end_pos].replace("\n", " ").strip()
                })

    return found_citations


def extract_all_citations(extracted_pages: list, output_file: str = None) -> list:
    """
    Extract citations across all document pages and save to citations.json.
    """
    if output_file is None:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        output_file = os.path.join(current_dir, "data", "citations.json")

    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    all_citations = []
    seen = set()

    for item in extracted_pages:
        doc_name = item.get("document", "")
        page_num = item.get("page", 0)
        text = item.get("text", "")

        parsed = parse_citations_from_text(text, document_name=doc_name, page_number=page_num)
        for c in parsed:
            key = (c["citation"].lower(), c["document"], c["page"])
            if key not in seen:
                seen.add(key)
                all_citations.append(c)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(all_citations, f, indent=2, ensure_ascii=False)

    print(f"Extracted {len(all_citations)} unique citations/case authorities into {output_file}")
    return all_citations


if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    extracted_json_path = os.path.join(current_dir, "data", "extracted_text", "extracted_text.json")
    if os.path.exists(extracted_json_path):
        with open(extracted_json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        extract_all_citations(data)
