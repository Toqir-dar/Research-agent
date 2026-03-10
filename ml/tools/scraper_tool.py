# tools/scraper_tool.py
import requests
from bs4 import BeautifulSoup
from core.config import MAX_SCRAPE_CHARS


def scrape_url(url: str) -> str:
    """
    Scrapes clean text content from a URL.
    Strips scripts, styles, nav, footer noise.
    """
    try:
        headers = {"User-Agent": "Mozilla/5.0 (compatible; ResearchBot/1.0)"}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        # Remove noise elements
        for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
            tag.decompose()

        text = soup.get_text(separator="\n", strip=True)
        return text[:MAX_SCRAPE_CHARS]

    except Exception as e:
        return f"[Scraping failed: {str(e)}]"