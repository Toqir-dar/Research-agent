# api/server.py
import sys
import os

# Ensure ml/ root is on the path when run from any directory
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import uuid
import asyncio
from datetime import datetime

from core.graph import run_research

# ── App Setup ─────────────────────────────────────────────────────
app = FastAPI(
    title="Research Agent API",
    description="Autonomous Research Agent powered by Groq + LangGraph",
    version="1.0.0"
)

# Allow Express backend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Express backend
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-memory job store ───────────────────────────────────────────
# Stores research jobs by job_id
# In production you'd use Redis or a database
jobs: dict = {}


# ── Request / Response Models ─────────────────────────────────────
class ResearchRequest(BaseModel):
    topic: str = Field(..., min_length=5, max_length=300,
                       example="Impact of LLMs on software engineering")

class JobStatus(BaseModel):
    job_id: str
    status: str           # queued | running | completed | error
    topic: str
    created_at: str
    completed_at: Optional[str] = None
    error: Optional[str] = None

class ResearchResult(BaseModel):
    job_id: str
    status: str
    topic: str
    plan: Optional[list] = None
    search_queries: Optional[list] = None
    sources_count: int = 0
    critique: Optional[str] = None
    report: Optional[str] = None
    word_count: int = 0
    iterations: int = 0
    created_at: str
    completed_at: Optional[str] = None
    error: Optional[str] = None


# ── Background Task ───────────────────────────────────────────────
def run_research_job(job_id: str, topic: str):
    """
    Runs the full LangGraph pipeline in the background.
    Updates the jobs store when complete.
    """
    try:
        jobs[job_id]["status"] = "running"
        print(f"\n🔬 Job {job_id}: Starting research on '{topic}'")

        final_state = run_research(topic)

        jobs[job_id].update({
            "status":       "completed",
            "completed_at": datetime.utcnow().isoformat(),
            "state":        final_state,
        })
        print(f"✅ Job {job_id}: Completed")

    except Exception as e:
        jobs[job_id].update({
            "status":       "error",
            "completed_at": datetime.utcnow().isoformat(),
            "error":        str(e),
        })
        print(f"❌ Job {job_id}: Error — {e}")


# ── Routes ────────────────────────────────────────────────────────

@app.get("/")
def root():
    """Health check endpoint."""
    return {
        "status":  "online",
        "service": "Research Agent API",
        "version": "1.0.0"
    }


@app.get("/health")
def health():
    """Detailed health check."""
    return {
        "status":      "healthy",
        "jobs_in_memory": len(jobs),
        "timestamp":   datetime.utcnow().isoformat()
    }


@app.post("/research", response_model=JobStatus, status_code=202)
def start_research(request: ResearchRequest, background_tasks: BackgroundTasks):
    """
    Starts a new research job asynchronously.
    Returns a job_id immediately — poll /research/{job_id} for results.
    
    Called by: Express backend POST /api/research
    """
    job_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()

    # Store job
    jobs[job_id] = {
        "job_id":     job_id,
        "topic":      request.topic,
        "status":     "queued",
        "created_at": created_at,
        "state":      None,
        "error":      None,
    }

    # Run pipeline in background (non-blocking)
    background_tasks.add_task(run_research_job, job_id, request.topic)

    print(f"📋 Job {job_id} queued for topic: '{request.topic}'")

    return JobStatus(
        job_id=job_id,
        status="queued",
        topic=request.topic,
        created_at=created_at,
    )


@app.get("/research/{job_id}", response_model=ResearchResult)
def get_research_result(job_id: str):
    """
    Polls the status and result of a research job.
    
    Called by: Express backend GET /api/research/:jobId
    
    Status values:
      queued    → job is waiting to start
      running   → pipeline is executing
      completed → report is ready
      error     → something went wrong
    """
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found")

    job = jobs[job_id]
    state = job.get("state")

    result = ResearchResult(
        job_id=job_id,
        status=job["status"],
        topic=job["topic"],
        created_at=job["created_at"],
        completed_at=job.get("completed_at"),
        error=job.get("error"),
    )

    # Attach full results if completed
    if state:
        result.plan           = state.get("plan")
        result.search_queries = state.get("search_queries")
        result.sources_count  = len(state.get("raw_sources") or [])
        result.critique       = state.get("critique")
        result.report         = state.get("report")
        result.word_count     = len((state.get("report") or "").split())
        result.iterations     = state.get("iteration", 0)

    return result


@app.get("/jobs")
def list_jobs():
    """Lists all jobs and their statuses. Useful for debugging."""
    return [
        {
            "job_id":     j["job_id"],
            "topic":      j["topic"],
            "status":     j["status"],
            "created_at": j["created_at"],
        }
        for j in jobs.values()
    ]


@app.delete("/research/{job_id}")
def delete_job(job_id: str):
    """Deletes a job from memory."""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    del jobs[job_id]
    return {"message": f"Job {job_id} deleted"}