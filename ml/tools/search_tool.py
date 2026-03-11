# tools/search_tool.py
import time
from ddgs import DDGS
from core.config import MAX_SEARCH_RESULTS


def duckduckgo_search(query: str) -> list[dict]:
    """
    Searches the web using DuckDuckGo — free, no API key needed.
    Includes retry logic for rate limiting.
    """
    results = []
    for attempt in range(3):
        try:
            with DDGS() as ddgs:
                for r in ddgs.text(query, max_results=MAX_SEARCH_RESULTS):
                    results.append({
                        "title":   r.get("title", ""),
                        "url":     r.get("href", ""),
                        "snippet": r.get("body", ""),
                    })
            if results:
                break
        except Exception as e:
            print(f"Search attempt {attempt + 1} failed: {e}")
            time.sleep(2)

    if not results:
        print("DuckDuckGo unavailable — ArXiv will still provide sources.")
    return results