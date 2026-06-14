import os
import httpx
import tempfile
import asyncio
from fastapi import UploadFile
from dotenv import load_dotenv
from sarvamai import SarvamAI

load_dotenv(override=True)

SARVAM_API_KEY = os.environ.get("SARVAM_API_KEY")
HEADERS = {"api-subscription-key": SARVAM_API_KEY}

sarvam_client = SarvamAI(api_subscription_key=SARVAM_API_KEY)


def _extract_text_from_pdf(path: str) -> str:
    """Local fallback: pull text directly from a typed PDF (no API needed)."""
    try:
        import pdfplumber
        text = ""
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text.strip()
    except Exception as e:
        print(f"pdfplumber fallback failed: {e}")
        return ""


async def ocr(file: UploadFile) -> str:
    """Extract text from a document. Tries Sarvam SDK; falls back to local PDF text extraction."""
    file_bytes = await file.read()
    if not file_bytes:
        return ""

    temp_path = None
    try:
        ext = os.path.splitext(file.filename)[1] or ".pdf"
        fd, temp_path = tempfile.mkstemp(suffix=ext)
        with os.fdopen(fd, "wb") as f:
            f.write(file_bytes)

        # Try the Sarvam SDK. The namespace differs by SDK version, so try the
        # known possibilities; if none work, we fall through to local extraction.
        text_content = ""
        try:
            client_ns = getattr(sarvam_client, "document_intelligence", None) \
                or getattr(sarvam_client, "document_digitization", None)
            if client_ns is not None:
                # try common method names
                method = getattr(client_ns, "digitize", None) \
                    or getattr(client_ns, "parse", None) \
                    or getattr(client_ns, "extract", None)
                if method is not None:
                    response = await asyncio.to_thread(method, file_path=temp_path)
                    # parse structured response if present
                    if hasattr(response, "pages"):
                        for page in response.pages:
                            if hasattr(page, "blocks"):
                                for block in page.blocks:
                                    if getattr(block, "text", None):
                                        text_content += block.text + "\n"
                    if not text_content:
                        # some SDKs return text directly
                        text_content = getattr(response, "text", "") or str(response)
        except Exception as e:
            print(f"Sarvam SDK OCR failed ({e}); using local PDF extraction.")

        # If Sarvam gave us nothing, fall back to local PDF text extraction
        if not text_content.strip():
            text_content = _extract_text_from_pdf(temp_path)

        return text_content.strip()
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


async def stt(file: UploadFile) -> str:
    url = "https://api.sarvam.ai/speech-to-text"
    file_bytes = await file.read()
    if not file_bytes:
        return ""
    files = {"file": (file.filename, file_bytes, file.content_type)}
    data = {"language_code": "hi-IN"}
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=HEADERS, files=files, data=data)
            response.raise_for_status()
            res_json = response.json()
            return res_json.get("transcript", str(res_json))
    except Exception as e:
        print(f"Warning: Sarvam STT API failed ({str(e)}).")
        return ""


async def translate(text: str, target_lang: str) -> str:
    url = "https://api.sarvam.ai/translate"
    payload = {
        "input": text,
        "source_language_code": "en-IN",
        "target_language_code": target_lang,
        "model": "mayura:v1"
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=HEADERS, json=payload)
        response.raise_for_status()
        res_json = response.json()
        return res_json.get("translated_text", str(res_json))


async def tts(text: str, language: str, speaker: str = "anushka") -> bytes:
    url = "https://api.sarvam.ai/text-to-speech"
    payload = {
        "text": text,
        "target_language_code": language,
        "speaker": speaker,
        "model": "bulbul:v2"
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=HEADERS, json=payload)
        # surface Sarvam's real error instead of a bare 400
        if response.status_code != 200:
            raise Exception(f"Sarvam TTS {response.status_code}: {response.text}")
        res_json = response.json()
        import base64
        if "audios" in res_json and len(res_json["audios"]) > 0:
            return base64.b64decode(res_json["audios"][0])
        return response.content        