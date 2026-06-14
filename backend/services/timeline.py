from datetime import datetime, timedelta
import dateutil.parser

async def generate(facts: dict, case_type: str) -> list[dict]:
    """Generate a timeline of hearings based on the arrest date or current date."""
    
    arrest_date_str = facts.get("arrest_date")
    base_date = datetime.now()
    
    if arrest_date_str:
        try:
            # Attempt to parse the date from facts
            parsed_date = dateutil.parser.parse(arrest_date_str, fuzzy=True)
            if parsed_date:
                base_date = parsed_date
        except Exception:
            pass # fallback to today's date

    hearings = []
    
    if case_type.lower() == "bail_application":
        hearings = [
            {
                "hearing_type": "FIR Filed",
                "hearing_date": base_date.date().isoformat(),
                "court": "Police Station",
                "location": facts.get("police_station", "Local Police Station"),
                "reminder_set": False
            },
            {
                "hearing_type": "File Bail Application",
                "hearing_date": (base_date + timedelta(days=4)).date().isoformat(),
                "court": "Sessions Court",
                "location": "District Sessions Court",
                "reminder_set": True
            },
            {
                "hearing_type": "Bail Hearing",
                "hearing_date": (base_date + timedelta(days=8)).date().isoformat(),
                "court": "Sessions Court",
                "location": "District Sessions Court",
                "reminder_set": True
            },
            {
                "hearing_type": "Charge Sheet Deadline",
                "hearing_date": (base_date + timedelta(days=50)).date().isoformat(),
                "court": "Magistrate Court",
                "location": "Local Magistrate Court",
                "reminder_set": False
            },
            {
                "hearing_type": "First Trial Date",
                "hearing_date": (base_date + timedelta(days=90)).date().isoformat(),
                "court": "Sessions Court",
                "location": "District Sessions Court",
                "reminder_set": False
            }
        ]
    else:
        # Default generic timeline for other case types
        hearings = [
            {
                "hearing_type": "Case Filed",
                "hearing_date": base_date.date().isoformat(),
                "court": "Civil Court",
                "location": "District Court",
                "reminder_set": False
            },
            {
                "hearing_type": "First Hearing",
                "hearing_date": (base_date + timedelta(days=30)).date().isoformat(),
                "court": "Civil Court",
                "location": "District Court",
                "reminder_set": True
            }
        ]

    return hearings
