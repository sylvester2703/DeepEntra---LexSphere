"""
FastAPI Verification API for LexSphere Citation Verification System.
Exposes RESTful endpoints for verification of legal citations and text passages.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional, Any

from citation_checker import verify_legal_text_citations

router = APIRouter(prefix="/api", tags=["Citation Verification"])


class VerificationRequest(BaseModel):
    text: str = Field(..., description="Legal answer or text containing citations to verify", example="According to Vidarbha Industries Power Limited vs Axis Bank Ltd (2022) 8 SCC 352, the NCLT has discretionary power.")


class VerificationCitationDetail(BaseModel):
    verified: bool
    status: str
    citation: str
    case_name: Optional[str] = None
    source_document: Optional[str] = None
    page_number: Optional[int] = None
    confidence_score: float
    matched_text: Optional[str] = None


class VerificationSource(BaseModel):
    document: Optional[str] = None
    page: Optional[int] = None
    case_name: Optional[str] = None
    similarity: Optional[float] = None


class VerificationResponse(BaseModel):
    verification_status: str
    citations: List[VerificationCitationDetail]
    sources: List[VerificationSource]


@router.post(
    "/verify-citation",
    response_model=VerificationResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify legal citations and text passages against judgment knowledge base"
)
async def verify_citation_endpoint(payload: VerificationRequest):
    """
    Verify legal citations and statements extracted from AI legal answers.
    Cross-references against Supreme Court judgment PDFs, extracted texts, and FAISS vector index.
    """
    if not payload.text or not payload.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request text payload cannot be empty."
        )

    try:
        result = verify_legal_text_citations(payload.text)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing citation verification: {str(e)}"
        )
