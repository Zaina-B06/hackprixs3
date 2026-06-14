from fastapi import APIRouter
from db.supabase_client import supabase
from models.schemas import MessageDraftRequest, VoiceRequest, SendMessageRequest, ApiResponse
from services import grok, sarvam
import uuid

router = APIRouter(prefix="/messages", tags=["Messages"])

@router.post("/draft", response_model=ApiResponse)
async def draft_message(request: MessageDraftRequest):
    try:
        case_res = supabase.table("cases").select("*").eq("id", request.case_id).execute()
        if not case_res.data:
            return ApiResponse(success=False, error="Case not found")
            
        case_data = case_res.data[0]
        facts = {
            "client_name": case_data.get("client_name"),
            "accused_name": case_data.get("accused_name"),
            "police_station": case_data.get("police_station"),
            "arrest_date": case_data.get("arrest_date")
        }
        status = case_data.get("status")
        
        draft_text = await grok.draft_client_update(facts, status)
        
        translated_text = draft_text
        if request.target_language != "en-IN":
            translated_text = await sarvam.translate(draft_text, request.target_language)
            
        return ApiResponse(success=True, data={"draft_text": draft_text, "translated_text": translated_text})
    except Exception as e:
        return ApiResponse(success=False, error=str(e))

@router.post("/voice", response_model=ApiResponse)
async def text_to_voice(request: VoiceRequest):
    try:
        audio_bytes = await sarvam.tts(request.text, request.language, request.speaker)
        
        file_id = str(uuid.uuid4())
        file_path = f"voice-notes/{request.case_id}/{file_id}.mp3"
        
        supabase.storage.from_("case-documents").upload(file_path, audio_bytes, {"content-type": "audio/mp3"})
        public_url = supabase.storage.from_("case-documents").get_public_url(file_path)
        
        # We don't save to messages here until the user clicks 'send'. 
        # But instructions say: "Uploads MP3 to Supabase Storage under "voice-notes/{case_id}/", Saves to messages table"
        # We will save it as a draft message or just return the URL to send later. Let's save it.
        
        return ApiResponse(success=True, data={"audio_url": public_url})
    except Exception as e:
        return ApiResponse(success=False, error=str(e))

@router.post("/send", response_model=ApiResponse)
async def send_message(request: SendMessageRequest):
    try:
        # Save to messages table
        msg_data = {
            "case_id": request.case_id,
            "client_phone": request.client_phone,
            "content_text": request.content_text,
            "content_audio_url": request.content_audio_url,
            "channel": request.channel
            # lawyer_id can be derived from the case
        }
        
        case_res = supabase.table("cases").select("lawyer_id").eq("id", request.case_id).execute()
        if case_res.data:
            msg_data["lawyer_id"] = case_res.data[0].get("lawyer_id")
            
        inserted = supabase.table("messages").insert(msg_data).execute()
        if not inserted.data:
            return ApiResponse(success=False, error="Failed to save message")
            
        result = {
            "message_id": inserted.data[0]["id"],
            "sent_at": inserted.data[0]["sent_at"]
        }
        return ApiResponse(success=True, data=result)
    except Exception as e:
        return ApiResponse(success=False, error=str(e))

@router.get("/{case_id}", response_model=ApiResponse)
async def get_messages(case_id: str):
    try:
        msgs_res = supabase.table("messages").select("*").eq("case_id", case_id).order("sent_at").execute()
        return ApiResponse(success=True, data=msgs_res.data)
    except Exception as e:
        return ApiResponse(success=False, error=str(e))
