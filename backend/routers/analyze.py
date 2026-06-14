from fastapi import APIRouter, UploadFile, File
from models.schemas import ApiResponse
from services import analyze

router = APIRouter(prefix="/analyze", tags=["Analyze"])


@router.post("", response_model=ApiResponse)
async def analyze_document(file: UploadFile = File(...)):
    try:
        raw_text = await analyze.read_document_text(file)
        if not raw_text.strip():
            return ApiResponse(success=False, error="Could not read text from document")
        extracted = await analyze.extract_with_quotes(raw_text)
        result = analyze.verify(extracted, raw_text)
        return ApiResponse(success=True, data=result)
    except Exception as e:
        return ApiResponse(success=False, error=str(e))