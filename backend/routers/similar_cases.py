from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel
from services.similar_cases.search_service import SearchService
from services.similar_cases.indian_kanoon_source import search_indian_kanoon

router = APIRouter()

# Initialize the search service once at module level
# (loads local cases, builds embeddings on first import)
search_service = SearchService()


class SearchRequest(BaseModel):
    query: str
    case_type: str = "All"
    include_online: bool = True


def _build_online_results(normalized_query, search_text: str) -> list[dict]:
    """Fallback: directly query Indian Kanoon if the main search didn't return online results."""
    query_embedding = search_service._build_query_embedding(normalized_query)
    query_terms = search_service._build_query_terms(normalized_query)
    intent_rule = search_service._detect_intent_rule(normalized_query)
    online_cases = search_indian_kanoon(search_text, max_results=10)
    if not online_cases:
        return []
    return search_service._build_online_case_records(online_cases, normalized_query, query_embedding, query_terms, intent_rule)


@router.post("/search")
def search_similar_cases(request: SearchRequest) -> dict:
    """Search for similar legal cases using text query.
    
    Uses a hybrid scoring system (lexical + intent + semantic) to find
    the most relevant cases from both the local seeded database and
    Indian Kanoon online database.
    """
    print(f"[Similar Cases] Search request: query='{request.query[:80]}...', case_type={request.case_type}, include_online={request.include_online}")
    
    normalized_query, local_results, online_results = search_service.search(
        request.query, request.case_type, request.include_online
    )
    
    # Fallback: if online was requested but no results came back, try direct Indian Kanoon fetch
    if request.include_online and not online_results:
        try:
            print("[Similar Cases] No online results from SearchService; attempting direct Indian Kanoon fetch")
            online_results = _build_online_results(
                normalized_query,
                normalized_query.search_query or request.query
            )
            print(f"[Similar Cases] Fallback Indian Kanoon results: {len(online_results)}")
        except Exception as e:
            print(f"[Similar Cases] Fallback fetch failed: {type(e).__name__}: {e}")
    
    # Merge: online results first (typically higher relevance), then local
    results = online_results + local_results if request.include_online and online_results else local_results
    
    # Sort combined results by similarity score descending
    results = sorted(results, key=lambda r: r.get("similarity_score", 0), reverse=True)
    
    return {
        "success": True,
        "normalized_query": normalized_query.model_dump(),
        "sources_used": ["local", "indian_kanoon"] if request.include_online and online_results else ["local"],
        "results": [item.model_dump() if hasattr(item, "model_dump") else item for item in results],
        "total_count": len(results),
    }
