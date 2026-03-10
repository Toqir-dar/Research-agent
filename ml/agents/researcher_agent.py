# agents/researcher_agent.py
from core.state import ResearchState
from tools.search_tool import duckduckgo_search
from tools.scraper_tool import scrape_url
from tools.arxiv_tool import search_arxiv


def researcher_agent(state: ResearchState) -> ResearchState:
    """
    Researcher Agent:
    - Input:  state['search_queries']
    - Output: state['raw_sources'], state['status']

    Uses DuckDuckGo for web sources and ArXiv for academic papers.
    Last query in the list is always sent to ArXiv.
    """
    print(f"\n🔍 Researcher Agent: Gathering sources...")

    queries = state.get("search_queries") or [state["topic"]]
    raw_sources = state.get("raw_sources") or []  # preserve sources if looping

    # ── Web Search (all queries except last) ──────────────────
    web_queries = queries[:-1]
    arxiv_query = queries[-1]

    for query in web_queries:
        print(f"   🌐 Web search: '{query}'")
        results = duckduckgo_search(query)

        for r in results[:2]:  # top 2 per query
            print(f"      Scraping: {r['url'][:60]}...")
            content = scrape_url(r["url"])

            raw_sources.append({
                "title":       r["title"],
                "url":         r["url"],
                "content":     content,
                "source_type": "web",
                "query":       query,
            })

    # ── ArXiv Academic Search (last query) ────────────────────
    print(f"   📚 ArXiv search: '{arxiv_query}'")
    papers = search_arxiv(arxiv_query, max_results=3)

    for paper in papers:
        raw_sources.append({
            "title":       paper["title"],
            "url":         paper["url"],
            "content":     paper["snippet"],
            "source_type": "arxiv",
            "authors":     paper.get("authors", []),
            "published":   paper.get("published", ""),
            "query":       arxiv_query,
        })

    state["raw_sources"] = raw_sources
    state["status"] = "researched"

    # Summary
    web_count   = sum(1 for s in raw_sources if s["source_type"] == "web")
    arxiv_count = sum(1 for s in raw_sources if s["source_type"] == "arxiv")
    print(f"\n✅ Sources gathered: {len(raw_sources)} total")
    print(f"   🌐 Web:   {web_count}")
    print(f"   📚 ArXiv: {arxiv_count}")

    return state