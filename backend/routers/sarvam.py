from fastapi import APIRouter, UploadFile, File, Body, Response, HTTPException
from fastapi.responses import JSONResponse
from services import sarvam

router = APIRouter(prefix="/sarvam", tags=["Sarvam AI"])

LANGUAGE_MAP = {
    "hindi": "hi-IN",
    "telugu": "te-IN",
    "tamil": "ta-IN",
    "english": "en-IN",
    "urdu": "ur-IN",
    "hi": "hi-IN",
    "te": "te-IN",
    "ta": "ta-IN",
    "en": "en-IN",
    "ur": "ur-IN",
}

@router.post("/tts")
async def text_to_speech(
    text: str = Body(..., embed=True),
    language: str = Body(..., embed=True),
):
    try:
        lang_code = LANGUAGE_MAP.get(language.lower(), "hi-IN")
        audio_bytes = await sarvam.tts(text, lang_code)
        if not audio_bytes:
            raise HTTPException(status_code=500, detail="Failed to generate audio from Sarvam AI")
        
        # Return audio as binary response
        return Response(content=audio_bytes, media_type="audio/wav")
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

@router.post("/stt")
async def speech_to_text(file: UploadFile = File(...)):
    try:
        transcript = await sarvam.stt(file)
        return {"success": True, "transcript": transcript}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/translate")
async def translate_text(
    text: str = Body(..., embed=True),
    target_language: str = Body(..., embed=True),
):
    try:
        lang_code = LANGUAGE_MAP.get(target_language.lower(), "hi-IN")
        translated = await sarvam.translate(text, lang_code)
        return {"success": True, "translated_text": translated}
    except Exception as e:
        return {"success": False, "error": str(e)}
