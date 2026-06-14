import json
import re
from fastapi import UploadFile
from services.grok import client, MODEL
from services import sarvam


async def read_document_text(file: UploadFile) -> str:
    """Reuse Sarvam digitisation to get raw text from the uploaded PDF."""
    return await sarvam.ocr(file)


async def extract_with_quotes(raw_text: str) -> dict:
    system = (
        "You are a legal document analyser for Indian courts (BNS/BNSS). "
        "For every item you extract, you MUST include the exact verbatim quote from the "
        "document text that supports it. Return ONLY valid JSON, no markdown."
    )
    user = (
        "From the document text below, extract and return this JSON:\n"
        "{\n"
        '  "facts": {\n'
        '    "case_number": {"value": "...", "quote": "verbatim text from doc"},\n'
        '    "court": {"value": "...", "quote": "..."},\n'
        '    "parties": {"value": ["...", "..."], "quote": "..."},\n'
        '    "hearing_date": {"value": "YYYY-MM-DD", "quote": "..."}\n'
        "  },\n"
        '  "named_sections": [\n'
        '    {"section": "BNS 318", "quote": "verbatim text where this section is named"}\n'
        "  ],\n"
        '  "suggested_sections": [\n'
        '    {"section": "BNS 318", "label": "cheating", "basis_fact": "verbatim sentence describing the act"}\n'
        "  ]\n"
        "}\n"
        "RULES:\n"
        "- Every 'quote' and 'basis_fact' MUST be a SINGLE CONTINUOUS span of text "
        "copied EXACTLY from the document, word for word, including punctuation.\n"
        "- NEVER join separate sentences with '...' or '…'. NEVER paraphrase or shorten. "
        "Pick ONE continuous sentence or phrase that actually appears verbatim.\n"
        "- For 'parties', quote ONE continuous phrase that names a party (e.g. the sentence "
        "introducing the complainant), not a stitched-together quote of both.\n"
        "- For 'suggested_sections', always give the SPECIFIC section number (e.g. 'BNS 318'), "
        "never a vague description like 'BNS section related to assault'.\n"
        "- 'named_sections' = sections whose number is literally written in the document.\n"
        "- 'suggested_sections' = offence sections you INFER from described facts, "
        "even though the number is NOT written in the document.\n"
        "- If something is not present, omit it. Do not invent quotes.\n\n"
        f"DOCUMENT TEXT:\n{raw_text}"
    )
    response = await client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "system", "content": system},
                  {"role": "user", "content": user}],
        temperature=0.0,
    )
    text = response.choices[0].message.content.strip()
    text = text.replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        try:
            m = re.search(r"\{.*\}", text, re.DOTALL)
            if m:
                # Attempt to repair common syntax errors (e.g. quote ends with ] instead of })
                fixed_text = m.group(0)
                fixed_text = re.sub(r'("quote":\s*"[^"]*")[ \t]*\]', r'\1}', fixed_text)
                fixed_text = re.sub(r'("basis_fact":\s*"[^"]*")[ \t]*\]', r'\1}', fixed_text)
                return json.loads(fixed_text)
        except Exception as repair_err:
            print(f"JSON repair failed: {repair_err}")
        return {
            "facts": {}, "named_sections": [], "suggested_sections": []
        }


def _find_span(raw_text: str, quote: str):
    """Find where a quote really sits in the document, tolerating whitespace differences.
    Returns [start, end] in the ORIGINAL text, or None if genuinely not found."""
    if not quote or not quote.strip():
        return None

    # 1. Exact match first
    idx = raw_text.find(quote)
    if idx != -1:
        return [idx, idx + len(quote)]

    # 2. Whitespace-tolerant match.
    # Build a regex from the quote where any run of whitespace matches any run of
    # whitespace in the original (handles line breaks, double spaces, etc.).
    cleaned = quote.strip()
    # If the AI joined fragments with "...", only use the part before the "..."
    if "..." in cleaned:
        cleaned = cleaned.split("...")[0].strip()
    if len(cleaned) < 4:
        return None

    # escape regex chars, then make whitespace flexible
    escaped = re.escape(cleaned)
    pattern = re.sub(r"\\\s+", r"\\s+", escaped)  # turn escaped spaces into \s+
    match = re.search(pattern, raw_text, re.IGNORECASE)
    if match:
        return [match.start(), match.end()]

    # 3. Last resort: match just the first ~8 words, so we land in the right area
    words = cleaned.split()
    if len(words) >= 3:
        snippet = " ".join(words[:8])
        snippet_pattern = re.sub(r"\s+", r"\\s+", re.escape(snippet))
        m2 = re.search(snippet_pattern, raw_text, re.IGNORECASE)
        if m2:
            return [m2.start(), m2.end()]

    return None


def verify(extracted: dict, raw_text: str) -> dict:
    facts = {}
    for key, item in (extracted.get("facts") or {}).items():
        quote = item.get("quote", "")
        span = _find_span(raw_text, quote)
        facts[key] = {"value": item.get("value"), "quote": quote,
                      "verified": span is not None, "span": span}

    named = []
    for item in (extracted.get("named_sections") or []):
        quote = item.get("quote", "")
        span = _find_span(raw_text, quote)
        named.append({"section": item.get("section"), "quote": quote,
                      "verified": span is not None, "span": span})

    suggested = []
    for item in (extracted.get("suggested_sections") or []):
        basis = item.get("basis_fact", "")
        span = _find_span(raw_text, basis)
        suggested.append({"section": item.get("section"), "label": item.get("label"),
                          "basis_fact": basis, "basis_span": span,
                          "verified_basis": span is not None,
                          "disclaimer": "AI-suggested from facts — verify against statute"})

    return {"raw_text": raw_text, "facts": facts,
            "named_sections": named, "suggested_sections": suggested}