from fastapi import APIRouter, Body
from services.draft import generate_draft
from models.schemas import ApiResponse

router = APIRouter()

@router.post("/draft")
async def draft_document(
    doc_type: str = Body(...),
    source_doc_ids: list = Body(...),   # ids from the documents table
):
    try:
        result = generate_draft(doc_type, source_doc_ids)
        return ApiResponse(success=True, data=result, error=None)
    except Exception as e:
        return ApiResponse(success=False, data=None, error=str(e))