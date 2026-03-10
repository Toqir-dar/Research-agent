# tools/arxiv_tool.py
import arxiv


def search_arxiv(query: str, max_results: int = 3) -> list[dict]:
    """
    Searches ArXiv for academic papers — free, no API key needed.
    """
    try:
        client = arxiv.Client()
        search = arxiv.Search(
            query=query,
            max_results=max_results,
            sort_by=arxiv.SortCriterion.Relevance,
        )
        results = []
        for paper in client.results(search):
            results.append({
                "title":     paper.title,
                "url":       paper.pdf_url,
                "snippet":   paper.summary[:500],
                "authors":   [a.name for a in paper.authors[:3]],
                "published": str(paper.published.date()),
                "source_type": "arxiv",
            })
        return results
    except Exception as e:
        print(f"⚠️ ArXiv error: {e}")
        return []