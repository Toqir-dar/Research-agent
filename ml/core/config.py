# core/config.py
import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "llama-3.3-70b-versatile"   # Free & fastest on Groq
EMBEDDING_MODEL = "all-MiniLM-L6-v2"     # Local HuggingFace, no cost
MAX_SEARCH_RESULTS = 5
MAX_SCRAPE_CHARS = 3000