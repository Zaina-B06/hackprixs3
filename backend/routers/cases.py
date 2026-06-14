import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional

from db.supabase_client import supabase
from models.schemas import CaseForm, ApiResponse
from services import case_builder, grok

router = APIRouter(prefix="/cases", tags=["Cases"])

@router.post("/{case_id}/save-analysis", response_model=ApiResponse)
async def save_analysis(
    case_id: str,
    analysis_result: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        # 1. Parse the analysis result
        try:
            analysis = json.loads(analysis_result)
        except Exception as e:
            return ApiResponse(success=False, error=f"Invalid JSON in analysis_result: {e}")

        facts = analysis.get("facts", {})
        named_sections = analysis.get("named_sections", [])
        suggested_sections = analysis.get("suggested_sections", [])
        raw_text = analysis.get("raw_text", "")

        # 2. Map extracted facts to the existing case columns in Supabase cases table
        case_update = {}

        # Map complainant
        comp_item = facts.get("complainant") or facts.get("complainant_name")
        if comp_item and comp_item.get("value"):
            case_update["complainant_name"] = comp_item["value"]

        # Map accused
        acc_item = facts.get("accused") or facts.get("accused_name")
        if acc_item and acc_item.get("value"):
            case_update["accused_name"] = acc_item["value"]
        elif "parties" in facts and facts["parties"].get("value"):
            parties_val = facts["parties"]["value"]
            if isinstance(parties_val, list) and len(parties_val) > 1:
                case_update["accused_name"] = parties_val[1]
                if not case_update.get("complainant_name"):
                    case_update["complainant_name"] = parties_val[0]
            elif isinstance(parties_val, str):
                case_update["accused_name"] = parties_val

        # Map case/FIR number
        case_num_item = facts.get("case_number") or facts.get("fo_number")
        if case_num_item and case_num_item.get("value"):
            case_update["fo_number"] = case_num_item["value"]

        # Map crime/BNS sections
        sections = [sec.get("section") for sec in named_sections if sec.get("section")]
        if sections:
            case_update["ipc_sections"] = sections

        # Build brief summary text
        case_num_val = (case_num_item.get("value") if case_num_item else None) or "N/A"
        compl_val = case_update.get("complainant_name") or "N/A"
        acc_val = case_update.get("accused_name") or "N/A"
        court_item = facts.get("court")
        court_val = (court_item.get("value") if court_item else None) or "N/A"
        hearing_item = facts.get("hearing_date")
        hearing_val = (hearing_item.get("value") if hearing_item else None) or "N/A"

        brief_summary = (
            f"AI Extracted Summary for Case:\n"
            f"- Case/FIR Number: {case_num_val}\n"
            f"- Complainant: {compl_val}\n"
            f"- Accused Party: {acc_val}\n"
            f"- Jurisdiction Court: {court_val}\n"
            f"- Next Hearing Date: {hearing_val}\n"
        )
        case_update["brief"] = brief_summary
        case_update["named_sections"] = named_sections
        case_update["suggested_sections"] = suggested_sections

        # Check if case exists, if not create it
        case_exists_res = supabase.table("cases").select("id").eq("id", case_id).execute()
        if not case_exists_res.data:
            new_case_record = {
                "id": case_id,
                "lawyer_id": "793776d8-0f5c-4232-a158-c94054b29666",
                "case_type": "criminal" if "criminal" in raw_text.lower() or "fir" in raw_text.lower() else "civil",
                "status": "active",
                "client_name": analysis.get("client_name"),
                "client_phone": analysis.get("client_phone"),
                "client_address": analysis.get("client_address")
            }
            new_case_record.update(case_update)
            supabase.table("cases").insert(new_case_record).execute()
        else:
            # Also allow updating client details if they were passed
            if analysis.get("client_name"):
                case_update["client_name"] = analysis.get("client_name")
            if analysis.get("client_phone"):
                case_update["client_phone"] = analysis.get("client_phone")
            if analysis.get("client_address"):
                case_update["client_address"] = analysis.get("client_address")
            supabase.table("cases").update(case_update).eq("id", case_id).execute()

        # 3. Save the uploaded document to the documents table and Supabase storage
        doc_url = None
        try:
            await file.seek(0)
            file_bytes = await file.read()
            
            # File path in bucket
            file_path = f"{case_id}/analysis_{file.filename}"
            
            supabase.storage.from_("case-documents").upload(file_path, file_bytes)
            
            # Get public URL
            public_url = supabase.storage.from_("case-documents").get_public_url(file_path)
            doc_url = public_url
            
            # Save to documents table
            doc_data = {
                "case_id": case_id,
                "file_name": file.filename,
                "file_url": public_url,
                "doc_type": "analysis_brief"
            }
            supabase.table("documents").insert(doc_data).execute()
        except Exception as e:
            print(f"Error uploading document: {e}")

        # 4. Save the hearing date to the hearings table if a hearing date was extracted
        if hearing_val and hearing_val != "N/A":
            try:
                # Check if this hearing already exists to avoid duplicates
                existing_hearings = supabase.table("hearings").select("*").eq("case_id", case_id).eq("hearing_date", hearing_val).execute()
                if not existing_hearings.data:
                    hearing_data = {
                        "case_id": case_id,
                        "hearing_date": hearing_val,
                        "hearing_type": "Bail Hearing" if "bail" in raw_text.lower() else "Hearing",
                        "court": court_val,
                        "location": court_val,
                        "reminder_set": True
                    }
                    supabase.table("hearings").insert(hearing_data).execute()
            except Exception as he:
                print(f"Error saving hearing: {he}")

        # 5. Fetch the updated case record
        updated_case_res = supabase.table("cases").select("*").eq("id", case_id).execute()
        updated_case = updated_case_res.data[0] if updated_case_res.data else {}
        
        # Fetch hearings
        hearings_res = supabase.table("hearings").select("*").eq("case_id", case_id).order("hearing_date").execute()
        updated_case["hearings"] = hearings_res.data
        
        # Fetch documents
        docs_res = supabase.table("documents").select("*").eq("case_id", case_id).execute()
        updated_case["documents"] = docs_res.data

        return ApiResponse(success=True, data=updated_case)
    except Exception as e:
        return ApiResponse(success=False, error=str(e))

@router.post("/create", response_model=ApiResponse)
async def create_case(
    case_type: str = Form(...),
    sub_type: Optional[str] = Form(None),
    client_name: str = Form(...),
    client_phone: str = Form(...),
    client_address: Optional[str] = Form(None),
    lawyer_id: str = Form(...),
    fir_image: Optional[UploadFile] = File(None),
    voice_note: Optional[UploadFile] = File(None)
):
    try:
        case_form = CaseForm(
            case_type=case_type,
            sub_type=sub_type,
            client_name=client_name,
            client_phone=client_phone,
            client_address=client_address,
            lawyer_id=lawyer_id
        )
        
        result = await case_builder.process_new_case(case_form, fir_image, voice_note)
        return ApiResponse(success=True, data=result)
    except Exception as e:
        return ApiResponse(success=False, error=str(e))

@router.get("/{case_id}", response_model=ApiResponse)
async def get_case(case_id: str):
    try:
        # Fetch case
        case_res = supabase.table("cases").select("*").eq("id", case_id).execute()
        if not case_res.data:
            return ApiResponse(success=False, error="Case not found")
        case_data = case_res.data[0]
        
        # Fetch hearings
        hearings_res = supabase.table("hearings").select("*").eq("case_id", case_id).order("hearing_date").execute()
        case_data["hearings"] = hearings_res.data
        
        # Fetch documents
        docs_res = supabase.table("documents").select("*").eq("case_id", case_id).execute()
        case_data["documents"] = docs_res.data
        
        return ApiResponse(success=True, data=case_data)
    except Exception as e:
        return ApiResponse(success=False, error=str(e))

@router.get("", response_model=ApiResponse)
async def get_cases_for_lawyer(lawyer_id: str):
    try:
        cases_res = supabase.table("cases").select("*").eq("lawyer_id", lawyer_id).order("created_at", desc=True).execute()
        return ApiResponse(success=True, data=cases_res.data)
    except Exception as e:
        return ApiResponse(success=False, error=str(e))

@router.post("/{case_id}/draft-bail", response_model=ApiResponse)
async def draft_bail(case_id: str):
    try:
        # Fetch case facts
        case_res = supabase.table("cases").select("*").eq("id", case_id).execute()
        if not case_res.data:
            # Create basic case record if it doesn't exist
            new_case = {
                "id": case_id,
                "lawyer_id": "793776d8-0f5c-4232-a158-c94054b29666",
                "case_type": "criminal",
                "status": "active"
            }
            supabase.table("cases").insert(new_case).execute()
            case_data = new_case
        else:
            case_data = case_res.data[0]
        
        facts = {
            "crime_type": case_data.get("crime_type"),
            "ipc_sections": case_data.get("ipc_sections"),
            "accused_name": case_data.get("accused_name") or case_data.get("client_name"),
            "police_station": case_data.get("police_station"),
            "place_of_offence": case_data.get("place_of_offence"),
            "arrest_date": case_data.get("arrest_date")
        }
        
        draft_text = await grok.draft_bail_application(facts)
        
        # Save draft to documents
        doc_data = {
            "case_id": case_id,
            "file_name": f"bail_draft_{case_id}.txt",
            "doc_type": "bail_draft",
            # We don't have a URL, but we can potentially upload to storage. 
            # Or just save the raw text/leave URL null if we only need the text in UI.
            # Sticking to UI text returning for now, saving to DB for record.
        }
        
        # We upload text as a document to storage
        try:
            file_path = f"{case_id}/bail_draft.txt"
            supabase.storage.from_("case-documents").upload(file_path, draft_text.encode('utf-8'))
            doc_data["file_url"] = supabase.storage.from_("case-documents").get_public_url(file_path)
        except Exception as e:
            print(f"Error uploading draft: {e}")
            
        inserted_doc = supabase.table("documents").insert(doc_data).execute()
        doc_id = inserted_doc.data[0]["id"] if inserted_doc.data else None
        
        return ApiResponse(success=True, data={"draft_text": draft_text, "doc_id": doc_id})
    except Exception as e:
        return ApiResponse(success=False, error=str(e))

@router.patch("/{case_id}/status", response_model=ApiResponse)
async def update_status(case_id: str, status: str = Form(...)):
    try:
        updated = supabase.table("cases").update({"status": status}).eq("id", case_id).execute()
        return ApiResponse(success=True, data=updated.data)
    except Exception as e:
        return ApiResponse(success=False, error=str(e))
