import os, json, re
from openai import OpenAI
from db.supabase_client import supabase

# This is Groq — OpenAI SDK pointed at Groq's endpoint (same as the analyzer)
client = OpenAI(
    api_key=os.environ["XAI_API_KEY"],          # your Groq key
    base_url="https://api.groq.com/openai/v1",
)

TEMPLATES = {
    "bail_application": {
        "description": "an Application for Bail under the BNSS, 2023",
        "structure": (
            "- Court Title (appropriate Sessions Court or Magistrate Court)\n"
            "- Accused/Applicant details (Name, Age, Address, Parentage)\n"
            "- FIR number, Police Station, and Sections of law charged\n"
            "- Factual background and Arrest Details\n"
            "- Grounds for Bail (numbered list showing lack of custodial need, cooperativeness, false implication, lack of criminal antecedents if applicable)\n"
            "- Undertaking to abide by all court conditions and furnish bail bonds\n"
            "- Prayer for release on bail"
        )
    },
    "legal_notice": {
        "description": "a Legal Notice",
        "structure": (
            "- Sender details (Client details on whose behalf notice is sent)\n"
            "- Recipient details (Name and Address of the opposing party)\n"
            "- Subject line (clear and concise summary of the notice)\n"
            "- Factual background (numbered list describing the dispute, agreements, or grievances)\n"
            "- The specific demand (rectification of breach, payments, or performance required)\n"
            "- Time limit to comply (typically 15 days)\n"
            "- Consequences of non-compliance (legal proceedings, cost liability)"
        )
    },
    "written_reply": {
        "description": "a Written Statement / Reply to the complaint",
        "structure": (
            "- Court Title and Case Details (Parties names, Case number)\n"
            "- Preliminary objections / submissions (lack of cause of action, jurisdiction, limitation, etc.)\n"
            "- Para-wise reply to the plaint/complaint (numbered matching paragraphs of the complaint, specifically admitting or denying each allegation)\n"
            "- Verification paragraph signed by the defendant"
        )
    },
    "vakalatnama": {
        "description": "a Vakalatnama (Power of Attorney appointing advocate)",
        "structure": (
            "- Court Title and Case Details\n"
            "- Client authority / appointment declaration (appointing {counsel_name} and associates as advocate)\n"
            "- Authority details (power to file applications, plead, sign briefs, receive payments, withdraw cases)\n"
            "- Signature of the Client / Appointor\n"
            "- Acceptance signature of the Advocate"
        )
    },
}

def _get_source_text_and_lawyer(doc_ids):
    """Follow each document to its case, pull the saved brief (where the
    extracted text actually lives), and retrieve the lawyer's name if available."""
    texts = []
    lawyer_name = None
    for did in doc_ids:
        case_id = None
        if str(did).startswith("mock_"):
            parts = did.split("_")
            if len(parts) >= 2:
                case_id = parts[1]
        else:
            # Check if did is a valid UUID before querying to avoid DB errors
            try:
                import uuid
                uuid.UUID(str(did))
                is_uuid = True
            except ValueError:
                is_uuid = False
            
            if is_uuid:
                doc = supabase.table("documents").select("case_id").eq("id", did).execute()
                if doc.data:
                    case_id = doc.data[0]["case_id"]
        
        if case_id:
            case = supabase.table("cases").select("*").eq("id", case_id).execute()
            if case.data:
                case_rec = case.data[0]
                brief = case_rec.get("brief")
                if brief:
                    texts.append(brief)
                else:
                    # Fallback summary using the case details in the database
                    fo_val = case_rec.get("fo_number") or "N/A"
                    compl_val = case_rec.get("complainant_name") or "N/A"
                    acc_val = case_rec.get("accused_name") or case_rec.get("client_name") or "N/A"
                    court_val = case_rec.get("court") or "N/A"
                    fallback_brief = (
                        f"AI Extracted Summary for Case:\n"
                        f"- Case/FIR Number: {fo_val}\n"
                        f"- Complainant: {compl_val}\n"
                        f"- Accused Party: {acc_val}\n"
                        f"- Jurisdiction Court: {court_val}\n"
                    )
                    texts.append(fallback_brief)
                
                # Retrieve lawyer name if not found yet
                if not lawyer_name and case_rec.get("lawyer_id"):
                    lawyer_res = supabase.table("lawyers").select("name").eq("id", case_rec["lawyer_id"]).execute()
                    if lawyer_res.data:
                        lawyer_name = lawyer_res.data[0].get("name")
                        
    return "\n\n".join(texts), lawyer_name

def generate_draft(doc_type, source_doc_ids):
    source, lawyer_name = _get_source_text_and_lawyer(source_doc_ids)

    if not source.strip():
        # honest failure instead of a [TO BE FILLED] skeleton
        return {
            "title": doc_type,
            "body": "No saved analysis found for the selected document(s). "
                    "Please run document analysis and click 'Save to case' first.",
            "citations": [],
        }

    template = TEMPLATES.get(doc_type)
    if isinstance(template, dict):
        template_desc = template["description"]
        structure_desc = template["structure"]
    else:
        template_desc = "a legal document"
        structure_desc = "Standard Indian court/legal format"

    # Inject lawyer name dynamically into vakalatnama or handle placeholder
    if doc_type == "vakalatnama":
        lawyer_str = lawyer_name if lawyer_name else "___________"
        structure_desc = structure_desc.replace("{counsel_name}", lawyer_str)

    prompt = (
        f"You are assisting an Indian lawyer. Draft {template_desc} based ONLY on the "
        f"facts in the source below. Use proper Indian court/legal format and follow this exact required structure:\n"
        f"{structure_desc}\n\n"
        f"CRITICAL: After every factual claim taken from the source, add a citation in the "
        f'form [SRC: "<exact quote from source>"]. Never invent facts. If a standard part '
        f"of the document needs a fact not in the source, write [TO BE FILLED].\n\n"
        f'Return ONLY valid JSON: {{"title": "...", "body": "...full draft with inline '
        f'[SRC: ...] citations and [TO BE FILLED] placeholders..."}}\n\n'
        f"SOURCE:\n{source}"
    )

    resp = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )
    txt = resp.choices[0].message.content.strip()
    txt = re.sub(r"^```json|```$", "", txt).strip()
    try:
        draft = json.loads(txt)
    except Exception:
        draft = {"title": doc_type, "body": txt}

    # Clean nested JSON strings in the body
    for _ in range(3):
        body_val = draft.get("body", "")
        if isinstance(body_val, str):
            body_val_clean = re.sub(r"^```json|```$", "", body_val.strip()).strip()
            if body_val_clean.startswith("{"):
                try:
                    inner_json = json.loads(body_val_clean)
                    if isinstance(inner_json, dict):
                        if "body" in inner_json:
                            draft["body"] = inner_json["body"]
                        if "title" in inner_json and (not draft.get("title") or draft["title"] == doc_type):
                            draft["title"] = inner_json["title"]
                        continue
                except Exception:
                    pass
        break

    # verify each citation exists in the source (your trust mechanism)
    cites = re.findall(r'\[SRC:\s*"([^"]+)"\]', draft.get("body", ""))
    draft["citations"] = [
        {"quote": q, "verified": q.strip()[:30] in source} for q in cites
    ]
    return draft