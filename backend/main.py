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

static_dir = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir)

app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
async def root():
    return FileResponse(os.path.join(static_dir, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
