from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class CaseForm(BaseModel):
    case_type: str
    sub_type: Optional[str] = None
    client_name: str
    client_phone: str
    client_address: Optional[str] = None
    lawyer_id: str

class ExtractedFacts(BaseModel):
    crime_type: Optional[str] = None
    ipc_sections: Optional[List[str]] = None
    accused_name: Optional[str] = None
    accused_address: Optional[str] = None
    arrest_date: Optional[str] = None
    arrest_time: Optional[str] = None
    police_station: Optional[str] = None
    place_of_offence: Optional[str] = None
    value_stolen_or_loss: Optional[str] = None
    complainant_name: Optional[str] = None
    fo_number: Optional[str] = None

class HearingItem(BaseModel):
    hearing_type: str
    hearing_date: str
    court: str
    location: str
    reminder_set: bool = False

class CaseResponse(BaseModel):
    case_id: str
    extracted_facts: Optional[ExtractedFacts] = None
    timeline: List[HearingItem] = []
    doc_url: Optional[str] = None

class MessageDraftRequest(BaseModel):
    case_id: str
    target_language: str

class VoiceRequest(BaseModel):
    case_id: str
    text: str
    language: str
    speaker: str = "meera"

class SendMessageRequest(BaseModel):
    case_id: str
    client_phone: str
    content_text: str
    content_audio_url: Optional[str] = None
    channel: str

class HearingCreateRequest(BaseModel):
    hearing_type: str
    hearing_date: str
    court: str
    location: str
    notes: Optional[str] = None

class ApiResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
