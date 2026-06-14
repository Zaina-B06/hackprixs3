import os
import json
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv(override=True)

# We load the key you set in XAI_API_KEY, but since it's a Groq key (gsk_...),
# we configure the OpenAI client to use the Groq API endpoint!
GROQ_API_KEY = os.environ.get("XAI_API_KEY")

client = AsyncOpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
)

MODEL = "llama-3.3-70b-versatile"

async def extract_case_facts(raw_text: str, case_type: str) -> dict:
    """Extract case facts from legal document text using Groq."""
    system_instruction = (
        "You are a legal document parser for Indian courts. Extract facts from FIR or "
        "legal document text. Return only valid JSON, no markdown, no explanation."
    )
    user_prompt = (
        f"Extract the following from this {case_type} document text and return as JSON:\n"
        "{\n"
        "  \"crime_type\": \"...\",\n"
        "  \"ipc_sections\": [\"...\"],\n"
        "  \"accused_name\": \"...\",\n"
        "  \"accused_address\": \"...\",\n"
        "  \"arrest_date\": \"...\",\n"
        "  \"arrest_time\": \"...\",\n"
        "  \"police_station\": \"...\",\n"
        "  \"place_of_offence\": \"...\",\n"
        "  \"value_stolen_or_loss\": \"...\",\n"
        "  \"complainant_name\": \"...\",\n"
        "  \"fo_number\": \"...\"\n"
        "}\n"
        f"TEXT: {raw_text}"
    )

    response = await client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.0
    )
    
    response_text = response.choices[0].message.content.strip()
    
    # Remove markdown formatting if present
    if response_text.startswith("```json"):
        response_text = response_text[7:]
    if response_text.endswith("```"):
        response_text = response_text[:-3]
        
    response_text = response_text.strip()
    
    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        # Retry once if invalid JSON
        response = await client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.0
        )
        response_text = response.choices[0].message.content.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        try:
            return json.loads(response_text.strip())
        except json.JSONDecodeError:
            return {"error_parsing": True, "raw_text": response_text}

async def draft_bail_application(facts: dict) -> str:
    """Draft a formal bail application using case facts via Groq."""
    system_instruction = "You are a senior Indian criminal lawyer drafting court documents."
    user_prompt = (
        f"Draft a complete formal bail application for the Sessions Court using these case facts: {facts}. "
        "Use standard Indian legal language. Include: court heading, applicant details, IPC sections, "
        "grounds for bail (no prior conviction, roots in community, cooperation with investigation), "
        "prayer clause, and verification. Output as plain text ready to print."
    )
    
    response = await client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.7
    )
    return response.choices[0].message.content

async def draft_client_update(facts: dict, case_status: str) -> str:
    """Draft a short, simple update for the client via Groq."""
    system_instruction = (
        "You are a helpful legal assistant writing plain-language updates for clients who are not lawyers."
    )
    user_prompt = (
        f"Write a short, simple, reassuring case update for the client based on: {facts}. "
        f"Status: {case_status}. Use simple language, no legal jargon, max 5 sentences."
    )
    
    response = await client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.7
    )
    return response.choices[0].message.content
