# core/state.py
from typing import TypedDict, List, Optional


class ResearchState(TypedDict):
    """
    Shared state object passed through the entire LangGraph pipeline.
    Each agent reads what it needs and writes its output back here.

    Flow:
      Planner   → writes: plan, search_queries
      Researcher → writes: raw_sources
      Critic    → writes: critique, needs_more_research
      Writer    → writes: report
    """

    # ── Input ─────────────────────────────────────────────
    topic: str                            # User's research topic

    # ── Planner output ────────────────────────────────────
    plan: Optional[List[str]]             # Sub-tasks list
    search_queries: Optional[List[str]]   # Search queries to run

    # ── Researcher output ─────────────────────────────────
    raw_sources: Optional[List[dict]]     # Scraped web + ArXiv content

    # ── Critic output ─────────────────────────────────────
    critique: Optional[str]               # Feedback on sources
    needs_more_research: bool             # Triggers re-search loop

    # ── Writer output ─────────────────────────────────────
    report: Optional[str]                 # Final markdown report

    # ── Pipeline control ──────────────────────────────────
    iteration: int                        # Loop counter (max 2)
    status: Optional[str]                 # Current pipeline status
    error: Optional[str]                  # Any error message