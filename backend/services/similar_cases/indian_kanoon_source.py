from __future__ import annotations

import os
import re
from typing import Any

import requests

SEARCH_URL = "https://api.indiankanoon.org/search/"
DOC_URL = "https://api.indiankanoon.org/doc/{doc_id}/"


def search_indian_kanoon(query: str, page: int = 0, max_results: int = 10) -> list[dict[str, Any]]:
    api_key = os.getenv("INDIAN_KANOON_API_KEY", "").strip()
    if not api_key:
        print("Indian Kanoon API key missing.")
        return []

    print("Indian Kanoon query:", query)
    try:
        response = requests.get(
            SEARCH_URL,
            params={"formInput": query, "pagenum": page},
            headers=_build_headers(api_key),
            timeout=30,
        )
        if response.status_code == 405:
            response = requests.post(
                SEARCH_URL,
                data={"formInput": query, "pagenum": page},
                headers=_build_headers(api_key),
                timeout=30,
            )
    except Exception as error:
        print("Indian Kanoon request failed:", str(error))
        return []

    if response.status_code in {401, 403}:
        print("Indian Kanoon authentication failed. Check token/header format.")
        return []
    if response.status_code != 200:
        print("Indian Kanoon non-200 status:", response.status_code, response.text[:500])
        return []

    payload = _safe_json(response)
    if isinstance(payload, dict):
        print("Indian Kanoon response keys:", list(payload.keys()))
    else:
        print("Indian Kanoon response keys:", type(payload).__name__)
    items = _extract_items(payload)
    normalized: list[dict[str, Any]] = []
    for item in items[:max_results]:
        normalized_item = _normalize_search_item(item, fallback_query=query)
        if normalized_item:
            normalized.append(normalized_item)
    return normalized


def normalize_indian_kanoon_source_url(record: dict[str, Any]) -> dict[str, Any]:
    normalized = dict(record)
    source_url = str(normalized.get("source_url") or "").strip()
    external_id = str(normalized.get("external_id") or "").strip()
    case_id = str(normalized.get("case_id") or "").strip()

    if not external_id and case_id.startswith("IK_"):
        external_id = case_id.removeprefix("IK_")
    if not source_url and external_id:
        source_url = f"https://indiankanoon.org/doc/{external_id}/"

    normalized["external_id"] = external_id or None
    normalized["source_url"] = source_url
    normalized["source_name"] = "Indian Kanoon"
    normalized["verification_status"] = "Source Available"
    normalized["data_origin"] = "online_indian_kanoon"
    return normalized


def get_indian_kanoon_document(doc_id: str) -> dict[str, Any]:
    api_key = os.getenv("INDIAN_KANOON_API_KEY", "").strip()
    source_url = f"https://indiankanoon.org/doc/{doc_id}/"
    minimal = {
        "external_id": doc_id,
        "case_name": doc_id,
        "court": "",
        "year": None,
        "case_type": "Unknown",
        "matter_type": "",
        "issue": "",
        "sections": [],
        "summary": "",
        "judgment": "Open source document for full judgment.",
        "citation": "",
        "source_url": source_url,
        "source_name": "Indian Kanoon",
        "verification_status": "Source Available",
        "keywords": [],
        "full_text": None,
        "data_origin": "online_indian_kanoon",
    }

    if not api_key:
        return minimal

    try:
        response = requests.get(DOC_URL.format(doc_id=doc_id), headers=_build_headers(api_key), timeout=30)
        response.raise_for_status()
    except Exception:
        return minimal

    payload = _safe_json(response)
    text = _extract_text(payload) or response.text.strip()
    normalized = _normalize_document_payload(payload, doc_id=doc_id, text=text)
    if not normalized.get("source_url"):
        normalized["source_url"] = source_url
    return normalized


def _build_headers(api_key: str) -> dict[str, str]:
    return get_indian_kanoon_headers(api_key)


def get_indian_kanoon_headers(token: str | None = None) -> dict[str, str]:
    token_value = (token or os.getenv("INDIAN_KANOON_API_KEY", "")).strip()
    if token_value.lower().startswith(("bearer ", "token ")):
        authorization = token_value
    else:
        authorization = f"Token {token_value}"
    return {"Authorization": authorization, "Accept": "application/json"}


def _safe_json(response: requests.Response) -> Any:
    try:
        return response.json()
    except Exception:
        return None


def _extract_items(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]
    if not isinstance(payload, dict):
        return []
    for key in ("results", "documents", "docs", "items", "hits", "searchresult"):
        value = payload.get(key)
        if isinstance(value, list):
            return [item for item in value if isinstance(item, dict)]
        if isinstance(value, dict):
            nested = _extract_items(value)
            if nested:
                return nested
    return [payload] if payload else []


def _normalize_search_item(item: dict[str, Any], fallback_query: str) -> dict[str, Any] | None:
    doc_id = str(_first_value(item, ["docid", "doc_id", "id", "caseid", "docnum"]) or "").strip()
    if not doc_id:
        raw_url = str(_first_value(item, ["url", "source_url", "docurl"]) or "").strip()
        doc_id = _extract_doc_id_from_url(raw_url)

    source_url = f"https://indiankanoon.org/doc/{doc_id}/" if doc_id else str(_first_value(item, ["url", "source_url"]) or "").strip()
    case_name = _first_value(item, ["title", "name", "headline", "case_name"]) or fallback_query
    court = _first_value(item, ["court", "bench", "source", "court_name"]) or ""
    citation = _first_value(item, ["citation", "cite", "shorttitle", "casecitation"]) or "Indian Kanoon Result"
    issue = _first_value(item, ["snippet", "summary", "issue", "headnote", "text"])
    if not issue:
        issue = fallback_query
    year = _extract_year(_first_value(item, ["year", "date", "judgment_date", "decision_date", "docdate"]))

    normalized = {
        "id": f"IK_{doc_id or abs(hash(source_url or case_name)) % 10_000_000}",
        "external_id": doc_id or None,
        "case_id": f"IK_{doc_id or abs(hash(source_url or case_name)) % 10_000_000}",
        "case_name": str(case_name).strip(),
        "court": str(court).strip(),
        "year": year,
        "case_type": "Unknown",
        "matter_type": "",
        "issue": str(issue).strip(),
        "sections": [],
        "summary": str(_first_value(item, ["summary", "snippet", "text"]) or issue).strip(),
        "judgment": "Open source document for full judgment.",
        "citation": str(citation).strip(),
        "source_url": source_url,
        "source_name": "Indian Kanoon",
        "verification_status": "Source Available" if source_url else "Unverified",
        "keywords": _build_keywords(case_name, issue, citation, fallback_query),
        "full_text": "",
        "data_origin": "online_indian_kanoon",
    }
    return normalized


def _normalize_document_payload(payload: Any, doc_id: str, text: str) -> dict[str, Any]:
    if isinstance(payload, dict):
        case_name = _first_value(payload, ["title", "name", "headline", "case_name"]) or doc_id
        court = _first_value(payload, ["court", "bench", "source", "court_name"]) or ""
        citation = _first_value(payload, ["citation", "cite", "shorttitle", "casecitation"]) or "Indian Kanoon Document"
        year = _extract_year(_first_value(payload, ["year", "date", "judgment_date", "decision_date", "docdate"]))
        source_url = f"https://indiankanoon.org/doc/{doc_id}/"
        return {
            "external_id": doc_id,
            "case_id": doc_id,
            "case_name": str(case_name).strip(),
            "court": str(court).strip(),
            "year": year,
            "case_type": "Unknown",
            "matter_type": "",
            "issue": text[:500].strip(),
            "sections": [],
            "summary": text[:1000].strip(),
            "judgment": "Open source document for full judgment.",
            "citation": str(citation).strip(),
            "source_url": source_url,
            "source_name": "Indian Kanoon",
            "verification_status": "Source Available",
            "keywords": _build_keywords(case_name, text, citation, doc_id),
            "full_text": text or None,
            "data_origin": "online_indian_kanoon",
        }
    return {
        "external_id": doc_id,
        "case_id": doc_id,
        "case_name": doc_id,
        "court": "",
        "year": None,
        "case_type": "Unknown",
        "matter_type": "",
        "issue": text[:500].strip(),
        "sections": [],
        "summary": text[:1000].strip(),
        "judgment": "Open source document for full judgment.",
        "citation": "Indian Kanoon Document",
        "source_url": f"https://indiankanoon.org/doc/{doc_id}/",
        "source_name": "Indian Kanoon",
        "verification_status": "Source Available",
        "keywords": _build_keywords(doc_id, text),
        "full_text": text or None,
        "data_origin": "online_indian_kanoon",
    }


def _first_value(item: dict[str, Any], keys: list[str]) -> Any:
    for key in keys:
        value = item.get(key)
        if value not in (None, "", [], {}):
            return value
    return None


def _extract_text(payload: Any) -> str:
    if isinstance(payload, str):
        return payload.strip()
    if isinstance(payload, list):
        parts = [_extract_text(item) for item in payload]
        return "\n".join(part for part in parts if part).strip()
    if not isinstance(payload, dict):
        return ""
    for key in ("text", "summary", "content", "body", "snippet", "judgment", "html"):
        value = payload.get(key)
        if isinstance(value, str) and value.strip():
            return re.sub(r"<[^>]+>", " ", value).strip()
        if isinstance(value, (dict, list)):
            nested = _extract_text(value)
            if nested:
                return nested
    return ""


def _extract_doc_id_from_url(url: str) -> str:
    match = re.search(r"/doc/([^/]+)/?", url or "")
    return match.group(1) if match else ""


def _extract_year(value: Any) -> int | None:
    if value is None:
        return None
    match = re.search(r"(19|20)\d{2}", str(value))
    return int(match.group(0)) if match else None


def _build_keywords(*parts: Any) -> list[str]:
    tokens: list[str] = []
    for part in parts:
        if part is None:
            continue
        for token in re.findall(r"[a-zA-Z0-9]+", str(part).lower()):
            if len(token) >= 3 and token not in tokens:
                tokens.append(token)
    return tokens[:12]
