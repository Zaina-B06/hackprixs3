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
        "name": "an Application for Bail under the BNSS, 2023",
        "structure": "court title (appropriate Sessions/Magistrate Court); applicant details; FIR/case number and sections of law; arrest details; grounds for bail (numbered list showing lack of custodial need, cooperation, no flight risk, etc.); undertaking to abide by conditions; prayer for release on bail with conditions"
    },

    "anticipatory_bail": {
        "name": "an Application for Anticipatory Bail under Section 482 of the BNSS, 2023",
        "structure": "court title (Sessions/High Court); applicant details; FIR/case number "
                     "and sections; apprehension of arrest; brief facts; grounds for "
                     "anticipatory bail (numbered) — false implication, cooperation, no flight "
                     "risk, readiness to abide by conditions; undertaking; prayer for "
                     "pre-arrest bail with conditions"
    },

    "legal_notice": {
        "name": "a Legal Notice",
        "structure": "sender (advocate on behalf of client) and recipient details; subject line; "
                     "factual background (numbered paragraphs); the specific demand; time to "
                     "comply (typically 15 days); consequences of non-compliance; signature block"
    },

    "reply_legal_notice": {
        "name": "a Reply to Legal Notice",
        "structure": "reference to the notice being replied to (date/sender); without-prejudice "
                     "clause; para-wise denial/response to each allegation in the original notice "
                     "(numbered); the client's version of facts; rebuttal of the demand; "
                     "reservation of rights; signature block"
    },

    "written_reply": {
        "name": "a Written Statement / Reply to the complaint",
        "structure": "court title; parties; preliminary objections/submissions; para-wise reply "
                     "to the plaint/complaint (admit/deny each, numbered); grounds of defence; "
                     "prayer to dismiss; verification clause; signature"
    },

    "plaint": {
        "name": "a Plaint (civil suit) under the Code of Civil Procedure",
        "structure": "court title; plaintiff and defendant details; jurisdiction clause; cause of "
                     "action with date; facts of the case (numbered paragraphs); the legal basis; "
                     "limitation clause; valuation and court-fee clause; relief/prayer sought; "
                     "verification"
    },

    "affidavit": {
        "name": "an Affidavit",
        "structure": "title (in the court/matter); deponent details (name, age, parentage, "
                     "address); numbered paragraphs stating facts within the deponent's knowledge; "
                     "statement that contents are true; verification clause with place and date; "
                     "signature of deponent and identification block"
    },

    "adjournment_application": {
        "name": "an Application for Adjournment",
        "structure": "court title; case number and parties; the date fixed; the reason adjournment "
                     "is sought (numbered, brief); statement that it is not for delay; prayer to "
                     "adjourn to a later date; signature of counsel"
    },

    "vakalatnama": {
        "name": "a Vakalatnama",
        "structure": "court title; case number and parties; appointment clause naming the "
                     "advocate {counsel_name} to appear on behalf of the party; standard authority clauses "
                     "(to act, plead, compromise, receive documents); acceptance by advocate; "
                     "signature of party and advocate; date"
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
            "body": "No saved analysis found for the selected document(s). "
                    "Please run document analysis and click 'Save to case' first.",
            "citations": [],
        }

    template = TEMPLATES.get(doc_type, {"name": "a legal document", "structure": "standard legal format"})
    template_desc = template["name"]
    template_structure = template["structure"]

    # Inject lawyer name dynamically into vakalatnama or handle placeholder
    if doc_type == "vakalatnama":
        lawyer_str = lawyer_name if lawyer_name else "___________"
        template_structure = template_structure.replace("{counsel_name}", lawyer_str)

    prompt = (
        f"You are assisting an Indian lawyer. Draft {template_desc} based ONLY on the "
        f"facts in the source below. Follow this exact structure: {template_structure}.\n\n"
        f"CRITICAL RULES FOR CITATIONS AND MISSING FACTS:\n"
        f"1. A [SRC: \"...\"] marker must contain ONLY a verbatim quote copied exactly from the source text. "
        f"It must never contain explanations, descriptions, or phrases like 'no quote available' or 'not mentioned in source.'\n"
        f"2. If a fact is NOT in the source, write ONLY a blank line ___________ for the lawyer to fill in — "
        f"do NOT add any [SRC: ...] marker next to it at all.\n"
        f"3. Citations are only for facts that genuinely come from the source, with the actual verbatim quote.\n\n"
        f'Return ONLY valid JSON: {{"title": "...", "body": "...full draft with inline [SRC: ...] citations and ___________ placeholders..."}}\n\n'
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

    # remove any [SRC: ...] that doesn't contain a real quote (no quotation marks = not a real citation)
    draft["body"] = re.sub(r'\[SRC:\s*(?!")[^\]]*\]', '', draft["body"])
    # also remove empty-quote citations
    draft["body"] = re.sub(r'\[SRC:\s*""\s*\]', '', draft["body"])

    # verify each citation exists in the source (your trust mechanism)
    cites = re.findall(r'\[SRC:\s*"([^"]+)"\]', draft.get("body", ""))
    draft["citations"] = [
        {"quote": q, "verified": q.strip()[:30] in source} for q in cites
    ]
    return draft