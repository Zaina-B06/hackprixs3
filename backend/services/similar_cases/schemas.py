from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field

CaseType = Literal["Civil", "Criminal", "All"]


class NormalizedQuery(BaseModel):
    case_type: CaseType
    matter_type: str
    legal_issue: str
    search_query: str = ""
    sections: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)
    facts: list[str] = Field(default_factory=list)


class CaseResult(BaseModel):
    case_id: str
    external_id: Optional[str] = None
    similarity_score: int
    verification_status: str = "Unverified"
    case_name: str
    court: str
    year: Optional[int] = None
    case_type: str
    matched_issue: str
    why_similar: str
    judgment: str
    citation: str
    source_url: str
    source_name: str = "Local Seeded DB"
    data_origin: str = "local_seeded"
    full_text: Optional[str] = None


class TextSearchRequest(BaseModel):
    case_type: CaseType = "All"
    query: str
    include_online: bool = False


class SaveResearchRequest(BaseModel):
    client_case_id: Optional[str] = None
    case_id: str
    notes: Optional[str] = None
