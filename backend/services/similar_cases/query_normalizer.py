from __future__ import annotations

import re
from typing import Literal

from services.similar_cases.schemas import NormalizedQuery

CaseType = Literal["Civil", "Criminal", "All"]

RULES = [
    {
        "keywords": ["builder", "flat", "registration", "possession", "consumer", "apartment"],
        "case_type": "Civil",
        "matter_type": "Builder dispute",
        "legal_issue": "Builder delay or flat registration dispute",
        "sections": ["Contract breach", "Consumer deficiency"],
        "keywords_out": ["builder", "flat", "registration", "payment", "delay", "consumer"],
    },
    {
        "keywords": ["tenant", "rent", "vacate", "eviction", "landlord"],
        "case_type": "Civil",
        "matter_type": "Rent eviction dispute",
        "legal_issue": "Rent, eviction, or possession dispute",
        "sections": ["Property law", "Injunction"],
        "keywords_out": ["tenant", "rent", "vacate", "eviction", "possession"],
    },
    {
        "keywords": ["money recovery", "loan", "repay", "repayment", "dues"],
        "case_type": "Civil",
        "matter_type": "Money recovery",
        "legal_issue": "Recovery of money or loan repayment dispute",
        "sections": ["Recovery suit", "Debt dispute"],
        "keywords_out": ["money", "recovery", "loan", "repay", "dues"],
    },
    {
        "keywords": ["fir", "cheating", "420", "fraud", "promise job"],
        "case_type": "Criminal",
        "matter_type": "Cheating / IPC 420",
        "legal_issue": "Cheating, fraud, or false promise allegation",
        "sections": ["IPC 420", "Investigation"],
        "keywords_out": ["fir", "cheating", "420", "fraud", "deception"],
    },
    {
        "keywords": ["murder", "homicide", "302", "kill", "killing", "attempt to murder", "307"],
        "case_type": "Criminal",
        "matter_type": "Murder / IPC 302",
        "legal_issue": "Murder or homicide allegation",
        "sections": ["IPC 302", "IPC 307"],
        "keywords_out": ["murder", "homicide", "kill", "302", "307", "attempt to murder"],
    },
    {
        "keywords": ["bail"],
        "case_type": "Criminal",
        "matter_type": "Bail application",
        "legal_issue": "Bail in a criminal matter",
        "sections": ["Bail", "Criminal procedure"],
        "keywords_out": ["bail", "anticipatory bail", "custody"],
    },
    {
        "keywords": ["406", "trust", "breach of trust"],
        "case_type": "Criminal",
        "matter_type": "Criminal breach of trust",
        "legal_issue": "Misappropriation or breach of trust allegation",
        "sections": ["IPC 406", "Trust breach"],
        "keywords_out": ["406", "trust", "misappropriation"],
    },
    {
        "keywords": ["cyber", "fraud", "upi", "otp", "wallet"],
        "case_type": "Criminal",
        "matter_type": "Cyber fraud",
        "legal_issue": "Online fraud or digital payment deception",
        "sections": ["IT Act", "IPC 420"],
        "keywords_out": ["cyber", "fraud", "upi", "otp", "wallet"],
    },
]

STOPWORDS = {
    "the", "and", "a", "an", "of", "to", "for", "in", "on", "at",
    "with", "after", "before", "did", "not", "but", "was", "is",
    "are", "were", "be", "been", "by", "from", "that", "this",
    "it", "he", "she", "they", "as", "into", "over", "under", "via",
}


def normalize_legal_query(input_text: str, case_type: CaseType = "All") -> NormalizedQuery:
    text = (input_text or "").strip()
    lowered = text.lower()
    detected = _detect_rule(lowered)
    resolved_case_type = case_type if case_type != "All" else detected["case_type"]

    if resolved_case_type == "All":
        resolved_case_type = detected["case_type"] or "All"

    tokens = [token for token in re.findall(r"[a-zA-Z0-9]+", lowered) if token not in STOPWORDS]
    keyword_seed = detected["keywords_out"] or tokens[:8]
    keywords = _dedupe(keyword_seed + tokens[:6])
    facts = _extract_facts(text)

    matter_type = detected["matter_type"] if detected["matter_type"] else _infer_generic_matter(text)
    legal_issue = detected["legal_issue"] if detected["legal_issue"] else _infer_generic_issue(text)
    sections = detected["sections"] if detected["sections"] else ["General legal issue"]

    return NormalizedQuery(
        case_type=resolved_case_type,
        matter_type=matter_type,
        legal_issue=legal_issue,
        search_query=_build_search_query(matter_type, legal_issue, sections, keywords, facts),
        sections=sections,
        keywords=keywords,
        facts=facts,
    )


def _detect_rule(lowered_text: str) -> dict:
    for rule in RULES:
        if any(keyword in lowered_text for keyword in rule["keywords"]):
            return rule
    return {"case_type": "All", "matter_type": "", "legal_issue": "", "sections": [], "keywords_out": []}


def _infer_generic_matter(text: str) -> str:
    return "General legal dispute" if text else "Unspecified legal dispute"


def _infer_generic_issue(text: str) -> str:
    return "General issue extracted from user input" if text else "No query provided"


def _extract_facts(text: str) -> list[str]:
    parts = [chunk.strip() for chunk in re.split(r"[\.;\n\r]+", text) if chunk.strip()]
    return parts[:5]


def _dedupe(values: list[str]) -> list[str]:
    seen: set[str] = set()
    unique: list[str] = []
    for value in values:
        normalized = value.strip().lower()
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        unique.append(value.strip())
    return unique[:12]


def _build_search_query(matter_type: str, legal_issue: str, sections: list[str], keywords: list[str], facts: list[str]) -> str:
    parts = [matter_type, legal_issue, *sections, *keywords, *facts]
    return " ".join(part.strip() for part in parts if part and part.strip()).strip()
