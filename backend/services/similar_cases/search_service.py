from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Any

import numpy as np

from services.similar_cases.schemas import CaseResult, NormalizedQuery
from services.similar_cases.query_normalizer import normalize_legal_query
from services.similar_cases.indian_kanoon_source import search_indian_kanoon

try:
    from sentence_transformers import SentenceTransformer
except Exception:  # pragma: no cover - optional dependency import guard
    SentenceTransformer = None

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data"
LEGAL_CASES_PATH = DATA_DIR / "legal_cases.json"

# Ensure .env is loaded for INDIAN_KANOON_API_KEY and ENABLE_ONLINE_SEARCH
try:
    from dotenv import load_dotenv
    load_dotenv(BASE_DIR / ".env", override=True)
except ImportError:
    pass


FIELD_WEIGHTS = {
    "case_name": 2.0,
    "matter_type": 3.0,
    "issue": 4.0,
    "sections": 3.0,
    "summary": 2.0,
    "judgment": 3.0,
    "keywords": 4.0,
    "citation": 1.0,
}

SOURCE_WEIGHTS = {
    "local_seeded": 1.0,
    "online_indian_kanoon": 0.92,
}

INTENT_RULES = [
    {
        "name": "murder",
        "tokens": {"murder", "homicide", "kill", "killing", "302", "307", "attempt", "attempted"},
        "boost": {"murder", "homicide", "kill", "302", "307", "attempt", "attempted", "assault", "violence"},
        "penalty": {"theft", "379", "cheating", "420", "fraud", "recovery", "rent", "builder"},
    },
    {
        "name": "theft",
        "tokens": {"theft", "379", "steal", "stolen", "snatching", "robbery"},
        "boost": {"theft", "379", "steal", "stolen", "robbery", "recovery"},
        "penalty": {"murder", "302", "307", "domestic", "bail"},
    },
    {
        "name": "cheating",
        "tokens": {"cheating", "420", "fraud", "fake", "promise", "job"},
        "boost": {"cheating", "420", "fraud", "deception", "money", "job"},
        "penalty": {"theft", "379", "murder", "302", "injunction"},
    },
    {
        "name": "cyber",
        "tokens": {"cyber", "upi", "otp", "wallet", "phishing", "online"},
        "boost": {"cyber", "upi", "otp", "wallet", "phishing", "online", "fraud"},
        "penalty": {"theft", "murder", "rent", "builder"},
    },
    {
        "name": "builder",
        "tokens": {"builder", "flat", "registration", "possession", "apartment", "consumer"},
        "boost": {"builder", "flat", "registration", "possession", "consumer", "apartment"},
        "penalty": {"murder", "302", "theft", "379"},
    },
    {
        "name": "rent",
        "tokens": {"tenant", "rent", "vacate", "eviction", "landlord"},
        "boost": {"tenant", "rent", "vacate", "eviction", "landlord"},
        "penalty": {"murder", "302", "theft", "379"},
    },
]

STOPWORD_TOKENS = {
    "the", "and", "a", "an", "of", "to", "for", "in", "on", "at",
    "with", "after", "before", "did", "not", "but", "was", "is",
    "are", "were", "be", "been", "by", "from", "that", "this",
    "it", "he", "she", "they", "as", "into", "over", "under", "via",
}


class SearchService:
    def __init__(self) -> None:
        self.cases = self._load_cases()
        self.model = self._load_model()
        self.case_text_map = {case["id"]: self._build_case_text(case) for case in self.cases}
        self.case_profiles = {case["id"]: self._build_case_profile(case) for case in self.cases}
        self.case_embeddings = self._build_case_embeddings() if self.model is not None else {}

    def search(self, query_text: str, case_type: str, include_online: bool = False) -> tuple[NormalizedQuery, list[CaseResult], list[CaseResult]]:
        normalized_query = normalize_legal_query(query_text, case_type)  # type: ignore[arg-type]
        query_embedding = self._encode_text(self._combined_query_text(normalized_query))
        query_terms = self._build_query_terms(normalized_query)
        intent_rule = self._detect_intent_rule(normalized_query)
        include_online = include_online and self._online_search_enabled() and self._has_indian_kanoon_key()

        print("Searching local database...")

        local_results = [self._build_case_record(case, normalized_query, query_embedding, query_terms, intent_rule) for case in self._filtered_cases(normalized_query.case_type)]
        print("Local results:", len(local_results))
        local_results = sorted(local_results, key=lambda item: item["similarity_score"], reverse=True)

        online_results: list[CaseResult] = []
        if include_online:
            online_query = normalized_query.search_query or self._combined_query_text(normalized_query)
            try:
                print("Searching Indian Kanoon...")
                online_cases = search_indian_kanoon(online_query, max_results=10)
                online_results = self._build_online_case_records(online_cases, normalized_query, query_embedding, query_terms, intent_rule)
                print("Online Indian Kanoon results:", len(online_results))
            except Exception:
                pass

        print("Combined results:", len(online_results) + len(local_results))
        return normalized_query, local_results[:10], online_results[:10]

    def _load_cases(self) -> list[dict[str, Any]]:
        return json.loads(LEGAL_CASES_PATH.read_text(encoding="utf-8"))

    def _online_search_enabled(self) -> bool:
        return os.getenv("ENABLE_ONLINE_SEARCH", "false").strip().lower() in {"1", "true", "yes", "on"}

    def _has_indian_kanoon_key(self) -> bool:
        return bool(os.getenv("INDIAN_KANOON_API_KEY", "").strip())

    def _load_model(self):
        if SentenceTransformer is None:
            return None
        try:
            return SentenceTransformer("all-MiniLM-L6-v2")
        except Exception:
            return None

    def _build_case_text(self, case: dict[str, Any]) -> str:
        sections = ", ".join(case.get("sections", []))
        keywords = ", ".join(case.get("keywords", []))
        return " ".join(
            [
                case.get("case_name", ""),
                case.get("matter_type", ""),
                case.get("issue", ""),
                sections,
                case.get("summary", ""),
                keywords,
                case.get("judgment", ""),
                case.get("citation", ""),
            ]
        )

    def _build_online_case_text(self, case: dict[str, Any]) -> str:
        if case.get("full_text"):
            return str(case.get("full_text"))
        return " ".join(
            [
                str(case.get("case_name", "")),
                str(case.get("issue", "")),
                str(case.get("summary", "")),
                str(case.get("citation", "")),
                str(case.get("source_name", "")),
            ]
        ).strip()

    def _build_case_profile(self, case: dict[str, Any]) -> dict[str, set[str]]:
        return {
            "case_name": self._token_set(case.get("case_name", "")),
            "matter_type": self._token_set(case.get("matter_type", "")),
            "issue": self._token_set(case.get("issue", "")),
            "sections": self._token_set(" ".join(case.get("sections", []))),
            "summary": self._token_set(case.get("summary", "")),
            "judgment": self._token_set(case.get("judgment", "")),
            "keywords": self._token_set(" ".join(case.get("keywords", []))),
            "citation": self._token_set(case.get("citation", "")),
            "all": self._token_set(self._build_case_text(case)),
        }

    def _build_online_case_profile(self, case: dict[str, Any]) -> dict[str, set[str]]:
        return {
            "case_name": self._token_set(str(case.get("case_name", ""))),
            "matter_type": self._token_set(str(case.get("matter_type", ""))),
            "issue": self._token_set(str(case.get("issue", ""))),
            "sections": self._token_set(" ".join(case.get("sections", []))),
            "summary": self._token_set(str(case.get("summary", ""))),
            "judgment": self._token_set(str(case.get("judgment", ""))),
            "keywords": self._token_set(" ".join(case.get("keywords", []))),
            "citation": self._token_set(str(case.get("citation", ""))),
            "all": self._token_set(self._build_online_case_text(case)),
        }

    def _build_case_embeddings(self) -> dict[str, np.ndarray]:
        embeddings: dict[str, np.ndarray] = {}
        texts = list(self.case_text_map.values())
        vectors = self.model.encode(texts, normalize_embeddings=True)  # type: ignore[union-attr]
        for case, vector in zip(self.cases, vectors):
            embeddings[case["id"]] = np.asarray(vector)
        return embeddings

    def _encode_text(self, text: str) -> np.ndarray | None:
        if self.model is None:
            return None
        vector = self.model.encode([text], normalize_embeddings=True)[0]  # type: ignore[union-attr]
        return np.asarray(vector)

    def _build_query_embedding(self, normalized_query: NormalizedQuery) -> np.ndarray | None:
        combined_query = normalized_query.search_query or self._combined_query_text(normalized_query)
        return self._encode_text(combined_query)

    def _combined_query_text(self, normalized_query: NormalizedQuery) -> str:
        return " ".join(
            [
                normalized_query.matter_type,
                normalized_query.legal_issue,
                " ".join(normalized_query.sections),
                " ".join(normalized_query.keywords),
                " ".join(normalized_query.facts),
            ]
        ).strip()

    def _filtered_cases(self, case_type: str) -> list[dict[str, Any]]:
        if case_type == "All":
            return self.cases
        return [case for case in self.cases if case.get("case_type") == case_type]

    def _filtered_online_cases(self, cases: list[dict[str, Any]], case_type: str) -> list[dict[str, Any]]:
        if case_type == "All":
            return cases
        return [case for case in cases if case.get("case_type") in {case_type, "Unknown"}]

    def _lexical_score(self, query_terms: set[str], case: dict[str, Any], online: bool = False) -> float:
        if not query_terms:
            return 0.0

        profile = self.case_profiles[case["id"]] if not online else self._build_online_case_profile(case)
        weighted_score = 0.0
        total_weight = 0.0
        for field, weight in FIELD_WEIGHTS.items():
            field_terms = profile[field if field in profile else "all"]
            if not field_terms:
                continue
            overlap = len(query_terms & field_terms)
            if overlap == 0:
                total_weight += weight
                continue
            coverage = overlap / max(len(query_terms), 1)
            weighted_score += weight * coverage * 100.0
            total_weight += weight

        return weighted_score / max(total_weight, 1.0)

    def _intent_score(self, intent_rule: dict[str, Any] | None, case: dict[str, Any], online: bool = False) -> float:
        if not intent_rule:
            return 0.0

        profile = self._build_online_case_profile(case)["all"] if online else self.case_profiles[case["id"]]["all"]
        boost_overlap = len(intent_rule["boost"] & profile)
        penalty_overlap = len(intent_rule["penalty"] & profile)
        score = (boost_overlap * 20.0) - (penalty_overlap * 10.0)
        return max(0.0, min(score, 100.0))

    def _semantic_score(self, case_id: str, query_embedding: np.ndarray | None, online_text: str | None = None) -> int:
        if query_embedding is None:
            return 0
        if case_id in self.case_embeddings:
            case_embedding = self.case_embeddings[case_id]
        elif online_text and self.model is not None:
            case_embedding = self._encode_text(online_text)
            if case_embedding is None:
                return 0
        else:
            return 0
        similarity = float(np.dot(query_embedding, case_embedding))
        return int(round(max(0.0, min(similarity, 1.0)) * 100))

    def _build_query_terms(self, normalized_query: NormalizedQuery) -> set[str]:
        values = [normalized_query.case_type, normalized_query.matter_type, normalized_query.legal_issue, *normalized_query.sections, *normalized_query.keywords, *normalized_query.facts]
        return {token for value in values for token in self._tokenize(value)}

    def _detect_intent_rule(self, normalized_query: NormalizedQuery) -> dict[str, Any] | None:
        query_terms = self._build_query_terms(normalized_query)
        query_text = " ".join([normalized_query.matter_type, normalized_query.legal_issue, " ".join(normalized_query.keywords)]).lower()
        for rule in INTENT_RULES:
            if rule["tokens"] & query_terms or any(token in query_text for token in rule["tokens"]):
                return rule
        return None

    def _tokenize(self, value: str) -> list[str]:
        return [token for token in re.findall(r"[a-z0-9]+", value.lower()) if token and token not in STOPWORD_TOKENS]

    def _token_set(self, value: str) -> set[str]:
        return set(self._tokenize(value))

    def _final_score(self, lexical_score: float, intent_score: float, semantic_score: int) -> int:
        if lexical_score == 0 and intent_score == 0:
            semantic_component = semantic_score * 0.08
        else:
            semantic_component = semantic_score * 0.22

        final_score = (lexical_score * 0.58) + (intent_score * 0.20) + semantic_component
        return int(round(max(0.0, min(final_score, 100.0))))

    def _why_similar(self, normalized_query: NormalizedQuery, case: dict[str, Any]) -> str:
        query_terms = self._build_query_terms(normalized_query)
        case_terms = self.case_profiles[case["id"]]["all"]
        overlap = [term for term in sorted(query_terms & case_terms)[:3]]
        if overlap:
            return f"Shared legal terms: {', '.join(overlap)}."
        return f"Closest factual and legal pattern to {normalized_query.matter_type.lower() or 'the issue raised'}."

    def _why_similar_online(self, normalized_query: NormalizedQuery, case: dict[str, Any]) -> str:
        query_terms = self._build_query_terms(normalized_query)
        case_terms = self._build_online_case_profile(case)["all"]
        overlap = [term for term in sorted(query_terms & case_terms)[:3]]
        if overlap:
            return f"Shared legal terms: {', '.join(overlap)}."
        return f"Source aligned with {normalized_query.matter_type.lower() or 'the issue raised'}."

    def _build_case_record(
        self,
        case: dict[str, Any],
        normalized_query: NormalizedQuery,
        query_embedding: np.ndarray | None,
        query_terms: set[str],
        intent_rule: dict[str, Any] | None,
    ) -> dict[str, Any]:
        lexical_score = self._lexical_score(query_terms, case)
        intent_score = self._intent_score(intent_rule, case)
        semantic_score = self._semantic_score(case["id"], query_embedding)
        return self._finalize_record(
            {
                "case_id": case["id"],
                "external_id": None,
                "case_name": case["case_name"],
                "court": case["court"],
                "year": case["year"],
                "case_type": case["case_type"],
                "matched_issue": case["issue"],
                "why_similar": self._why_similar(normalized_query, case),
                "judgment": case["judgment"],
                "citation": case["citation"],
                "source_url": case["source_url"],
                "source_name": "Local Seeded DB",
                "verification_status": "Verified" if case.get("source_url") else "Unverified",
                "data_origin": "local_seeded",
                "full_text": self._build_case_text(case),
            },
            lexical_score,
            intent_score,
            semantic_score,
            source_weight=SOURCE_WEIGHTS["local_seeded"],
        )

    def _build_online_case_records(
        self,
        cases: list[dict[str, Any]],
        normalized_query: NormalizedQuery,
        query_embedding: np.ndarray | None,
        query_terms: set[str],
        intent_rule: dict[str, Any] | None,
    ) -> list[dict[str, Any]]:
        records: list[dict[str, Any]] = []
        for index, case in enumerate(self._filtered_online_cases(cases, normalized_query.case_type)):
            lexical_score = self._lexical_score(query_terms, case, online=True)
            intent_score = self._intent_score(intent_rule, case, online=True)
            online_text = self._build_online_case_text(case)
            semantic_score = self._semantic_score(str(case.get("case_id") or case.get("external_id") or case.get("source_url") or case.get("case_name")), query_embedding, online_text=online_text)
            record = self._finalize_record(
                self._normalize_indian_kanoon_record(case, normalized_query),
                lexical_score,
                intent_score,
                semantic_score,
                source_weight=SOURCE_WEIGHTS["online_indian_kanoon"],
                rank_bonus=max(0.0, 16.0 - (index * 1.5)),
            )
            records.append(record)
        return records

    def _finalize_record(
        self,
        record: dict[str, Any],
        lexical_score: float,
        intent_score: float,
        semantic_score: int,
        source_weight: float,
        rank_bonus: float = 0.0,
    ) -> dict[str, Any]:
        final_score = self._final_score(lexical_score, intent_score, semantic_score)
        adjusted_score = int(round(min(100.0, (final_score + rank_bonus) * source_weight)))
        if adjusted_score == 0 and (lexical_score > 0 or intent_score > 0 or semantic_score > 0):
            adjusted_score = 1
        record["similarity_score"] = adjusted_score
        return record

    def _normalize_indian_kanoon_record(self, case: dict[str, Any], normalized_query: NormalizedQuery) -> dict[str, Any]:
        raw_case_id = str(case.get("case_id") or case.get("external_id") or case.get("source_url") or case.get("case_name") or "").strip()
        external_id = str(case.get("external_id") or "").strip()
        if not external_id and raw_case_id.startswith("IK_"):
            external_id = raw_case_id.removeprefix("IK_")
        if not external_id and raw_case_id.isdigit():
            external_id = raw_case_id

        source_url = str(case.get("source_url") or "").strip()
        if not source_url and external_id:
            source_url = f"https://indiankanoon.org/doc/{external_id}/"
        if not source_url and raw_case_id.startswith("IK_"):
            source_url = f"https://indiankanoon.org/doc/{raw_case_id.removeprefix('IK_')}/"

        return {
            "case_id": raw_case_id or f"IK_{external_id or 'unknown'}",
            "external_id": external_id or None,
            "case_name": str(case.get("case_name", "")).strip() or normalized_query.legal_issue,
            "court": str(case.get("court", "")).strip(),
            "year": case.get("year"),
            "case_type": str(case.get("case_type", "Unknown")),
            "matched_issue": str(case.get("issue", "")).strip(),
            "why_similar": self._why_similar_online(normalized_query, case),
            "judgment": str(case.get("judgment", "Open source document for full judgment.")).strip(),
            "citation": str(case.get("citation", "")).strip(),
            "source_url": source_url,
            "source_name": "Indian Kanoon",
            "verification_status": "Source Available",
            "data_origin": "online_indian_kanoon",
            "full_text": case.get("full_text") or "",
        }
