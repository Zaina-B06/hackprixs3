from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from routers.cases import router as cases_router
from routers.messages import router as messages_router
from routers.hearings import router as hearings_router
from routers.analyze import router as analyze_router
from routers.draft import router as draft_router
from routers.sarvam import router as sarvam_router
from routers.similar_cases import router as similar_cases_router

app = FastAPI(title="CaseSaarthi API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cases_router, prefix="/api")
app.include_router(messages_router, prefix="/api")
app.include_router(hearings_router, prefix="/api")
app.include_router(analyze_router, prefix="/api")
app.include_router(draft_router, prefix="/api")
app.include_router(sarvam_router, prefix="/api")
app.include_router(similar_cases_router, prefix="/api/similar-cases")

@app.get("/api/health")
async def health():
    return {"status": "ok", "app": "CaseSaarthi"}

# --- Serve React SPA from /static ---
static_dir = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir)

# Serve static assets (JS, CSS, images, etc.)
app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets") if os.path.exists(os.path.join(static_dir, "assets")) else static_dir), name="assets")

# SPA catch-all: any non-API route serves index.html for client-side routing
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # Try to serve the exact file first (favicon.svg, etc.)
    file_path = os.path.join(static_dir, full_path)
    if full_path and os.path.isfile(file_path):
        return FileResponse(file_path)
    # Fallback to index.html for SPA routing
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "CourtSaarthi API is running. Frontend not built yet."}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
