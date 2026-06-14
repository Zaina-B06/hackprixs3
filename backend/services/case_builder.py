import random
from datetime import datetime
from fastapi import UploadFile
from typing import Optional

from db.supabase_client import supabase
from models.schemas import CaseForm
from services import sarvam
from services import grok
from services import timeline

async def process_new_case(
    case_form: CaseForm, 
    fir_image: Optional[UploadFile] = None, 
    voice_note: Optional[UploadFile] = None
) -> dict:
    """Process a new case creation request."""
    
    raw_text = ""
    
    if fir_image:
        ocr_text = await sarvam.ocr(fir_image)
        raw_text += ocr_text + "\n"
        
    if voice_note:
        stt_text = await sarvam.stt(voice_note)
        raw_text += stt_text + "\n"
        
    extracted = {}
    if raw_text.strip():
        extracted = await grok.extract_case_facts(raw_text, case_form.case_type)
        
    # Generate Case ID
    year = datetime.now().year
    seq = str(random.randint(1000, 9999))
    prefix = "CRIM" if case_form.case_type.lower() in ["criminal", "bail_application"] else "CIV"
    case_id = f"{prefix}-{year}-{seq}"
    
    # Insert into Supabase cases table
    case_data = {
        "id": case_id,
        "lawyer_id": case_form.lawyer_id,
        "case_type": case_form.case_type,
        "sub_type": case_form.sub_type,
        "client_name": case_form.client_name,
        "client_phone": case_form.client_phone,
        "client_address": case_form.client_address,
        "status": "active"
    }
    
    # Merge extracted facts into case_data where applicable
    if extracted:
        case_data.update({
            "ipc_sections": extracted.get("ipc_sections", []),
            "crime_type": extracted.get("crime_type"),
            "accused_name": extracted.get("accused_name"),
            "police_station": extracted.get("police_station"),
            "place_of_offence": extracted.get("place_of_offence"),
            "arrest_date": extracted.get("arrest_date"),
            "arrest_time": extracted.get("arrest_time"),
            "value_stolen": extracted.get("value_stolen_or_loss"),
            "complainant_name": extracted.get("complainant_name"),
            "fo_number": extracted.get("fo_number")
        })
        
    # Remove any None values to allow DB defaults/nulls
    case_data = {k: v for k, v in case_data.items() if v is not None}
    
    supabase.table("cases").insert(case_data).execute()
    
    # Generate timeline
    timeline_data = await timeline.generate(extracted, case_form.case_type)
    
    # Insert timeline into hearings table
    if timeline_data:
        hearings_insert = []
        for h in timeline_data:
            hearings_insert.append({
                "case_id": case_id,
                "hearing_date": h["hearing_date"],
                "hearing_type": h["hearing_type"],
                "court": h["court"],
                "location": h["location"],
                "reminder_set": h["reminder_set"]
            })
        supabase.table("hearings").insert(hearings_insert).execute()
        
    doc_url = None
    # Upload FIR Image to Storage and save in documents
    if fir_image:
        try:
            # We need to read the file again or just reset its pointer since it was read in OCR
            await fir_image.seek(0)
            file_bytes = await fir_image.read()
            
            # File path in bucket
            file_path = f"{case_id}/fir_{fir_image.filename}"
            
            supabase.storage.from_("case-documents").upload(file_path, file_bytes)
            
            # Get public URL
            public_url = supabase.storage.from_("case-documents").get_public_url(file_path)
            doc_url = public_url
            
            # Save to documents table
            doc_data = {
                "case_id": case_id,
                "file_name": fir_image.filename,
                "file_url": public_url,
                "doc_type": "FIR"
            }
            supabase.table("documents").insert(doc_data).execute()
        except Exception as e:
            print(f"Error uploading document: {e}")
            
    return {
        "case_id": case_id,
        "extracted_facts": extracted,
        "timeline": timeline_data,
        "doc_url": doc_url
    }
