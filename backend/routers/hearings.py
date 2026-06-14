from fastapi import APIRouter
from datetime import datetime
from db.supabase_client import supabase
from models.schemas import HearingCreateRequest, ApiResponse

router = APIRouter(prefix="/hearings", tags=["Hearings"])

@router.get("/today", response_model=ApiResponse)
async def get_todays_hearings(lawyer_id: str):
    try:
        today_str = datetime.now().date().isoformat()
        
        # Using Supabase foreign key join
        res = supabase.table("hearings").select("*, cases!inner(lawyer_id)").eq("cases.lawyer_id", lawyer_id).eq("hearing_date", today_str).execute()
        return ApiResponse(success=True, data=res.data)
    except Exception as e:
        # Fallback if join syntax fails
        print("Join query failed, using separate queries...", e)
        try:
            cases_res = supabase.table("cases").select("id").eq("lawyer_id", lawyer_id).execute()
            if not cases_res.data:
                return ApiResponse(success=True, data=[])
                
            case_ids = [c["id"] for c in cases_res.data]
            
            hearings_res = supabase.table("hearings").select("*").in_("case_id", case_ids).eq("hearing_date", today_str).execute()
            return ApiResponse(success=True, data=hearings_res.data)
        except Exception as e2:
            return ApiResponse(success=False, error=str(e2))

@router.get("/{case_id}", response_model=ApiResponse)
async def get_hearings(case_id: str):
    try:
        res = supabase.table("hearings").select("*").eq("case_id", case_id).order("hearing_date").execute()
        return ApiResponse(success=True, data=res.data)
    except Exception as e:
        return ApiResponse(success=False, error=str(e))


@router.post("/{case_id}", response_model=ApiResponse)
async def add_hearing(case_id: str, request: HearingCreateRequest):
    try:
        hearing_data = {
            "case_id": case_id,
            "hearing_type": request.hearing_type,
            "hearing_date": request.hearing_date,
            "court": request.court,
            "location": request.location,
            "notes": request.notes
        }
        
        res = supabase.table("hearings").insert(hearing_data).execute()
        return ApiResponse(success=True, data=res.data[0] if res.data else None)
    except Exception as e:
        return ApiResponse(success=False, error=str(e))

@router.patch("/{hearing_id}/reminder", response_model=ApiResponse)
async def toggle_reminder(hearing_id: str):
    try:
        # Get current state
        res = supabase.table("hearings").select("reminder_set").eq("id", hearing_id).execute()
        if not res.data:
            return ApiResponse(success=False, error="Hearing not found")
            
        current_state = res.data[0].get("reminder_set", False)
        new_state = not current_state
        
        # Update state
        update_res = supabase.table("hearings").update({"reminder_set": new_state}).eq("id", hearing_id).execute()
        return ApiResponse(success=True, data=update_res.data[0] if update_res.data else None)
    except Exception as e:
        return ApiResponse(success=False, error=str(e))

