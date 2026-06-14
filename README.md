# CourtSaarthi

**An AI legal assistant for Indian lawyers that reads your case documents, extracts and drafts what you need, and cites every fact back to its source — so you can trust it.**

---

## The Problem

India's solo and small-firm lawyers are underserved by legal AI. Existing tools are English-first, enterprise-priced, and — worst of all — untrustworthy: a lawyer can't tell whether the AI actually read the case file or simply made the answer up. CourtSaarthi is built around closing that trust gap.

## The Principle

One idea runs through the whole product:

> **AI proposes → our code verifies → the lawyer confirms.**

The model is never the final authority. Every fact it surfaces is checked against the source document by deterministic code before it's shown, and nothing is committed to a case until the lawyer approves it.

---

## Features

### 1. Verifiable Extraction
Upload any legal document (PDF or scan). CourtSaarthi extracts the key facts and applicable sections, and **cites every one to the exact line it came from**. The AI proposes a quote; our code verifies the quote actually exists in the document before displaying it. Anything it can't confirm is flagged — never fabricated.

### 2. Smart Section Mapping
It distinguishes sections **literally named** in the document from offences it **infers from the facts** (clearly badged "AI-suggested — verify against statute"), each tied to the fact that justifies it.

### 3. Self-Building Case Files
Extract once, and the case populates itself — the brief, parties, dates, and documents — all from verified data, saved only when the lawyer confirms.

### 4. Document Drafter
From those same verified facts, draft court-ready documents — bail applications, anticipatory bail, legal notices, replies, plaints, affidavits, vakalatnamas — in proper format, downloadable as PDF. It fills what the case proves and leaves clean blanks for what only the lawyer can supply. It never invents facts.

### 5. Multilingual Client Updates
Generate spoken updates for clients in their own language (Hindi, Telugu, Tamil, and more) via text-to-speech, so lawyers can keep clients informed across the language barrier.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Reasoning (extraction & drafting) | Groq — Llama 3.3 70B |
| Language (OCR, translation, text-to-speech) | Sarvam AI |
| Verification (citation checking) | Custom Python logic |
| Backend | FastAPI (Python) |
| Frontend | React + Vite |
| Database & storage | Supabase |

The drafting and extraction reasoning runs on Llama 3.3 70B via Groq. The language layer — reading documents, translation, and voice — runs on Sarvam AI. The citation-verification layer that checks every quote against the source is our own code.

---

## Project Structure

```
.
├── backend/          # FastAPI backend
│   ├── routers/      # API endpoints (analyze, draft, cases, sarvam, ...)
│   ├── services/     # Core logic (extraction, drafting, sarvam, ...)
│   ├── db/           # Supabase client
│   └── main.py
├── courtsaarthi/     # React + Vite frontend
│   └── src/App.jsx
└── add_analysis_columns.sql   # DB migrations
```

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- A Supabase project
- API keys: Groq, Sarvam AI

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in `backend/` (this is gitignored — never commit it):

```
SARVAM_API_KEY=your_sarvam_key
XAI_API_KEY=your_groq_key          # named XAI_API_KEY but holds the Groq key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
```

Run the database migrations in your Supabase SQL editor (see `add_analysis_columns.sql`).

Start the server:

```bash
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`.

### 2. Frontend

```bash
cd courtsaarthi
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

Both must be running for the app to work.

---

## Roadmap

- Verify AI-suggested sections against the actual bare acts (BNS / BNSS / BSA) via retrieval
- Deadline and statutory-clock tracking from legal rules
- Fuller multi-document drafting from complete case context
- Automated client updates and messaging
- Document encryption

---

## Note

This project was built at a hackathon. All sample case documents are fictitious and created solely for testing — names, events, and details are invented and do not refer to any real person or proceeding.
