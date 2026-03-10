# core/llm.py
from langchain_groq import ChatGroq
from core.config import GROQ_API_KEY, GROQ_MODEL

def get_llm(temperature: float = 0.3) -> ChatGroq:
    """
    Returns a Groq-powered ChatGroq instance.
    Llama 3.1 70B is free and extremely fast on Groq.
    """
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY not found. Check your .env file.")
    
    return ChatGroq(
        api_key=GROQ_API_KEY,
        model=GROQ_MODEL,
        temperature=temperature,
    )