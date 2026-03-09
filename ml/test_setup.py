# test_setup.py — run this to verify your setup
import os
from dotenv import load_dotenv

load_dotenv()

print("Testing imports...")

from langchain_groq import ChatGroq
from langgraph.graph import StateGraph
from duckduckgo_search import DDGS
import arxiv
import fastapi

print("✅ All imports successful!")

key = os.getenv("GROQ_API_KEY")
if key and key != "your_groq_api_key_here":
    print("✅ Groq API key found!")
else:
    print("⚠️  Groq API key missing — update your .env file")

print("\n🎉 Setup complete! Ready for Step 2.")