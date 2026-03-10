# agents/writer_agent.py
from langchain.prompts import ChatPromptTemplate
from core.llm import get_llm
from core.state import ResearchState

llm = get_llm(temperature=0.5)

WRITER_PROMPT = ChatPromptTemplate.from_template("""
You are an expert research writer. Write a comprehensive, well-structured
research report based on the sources provided.

Topic: {topic}

Research Plan:
{plan}

Critic's Notes: {critique}

Sources:
{sources}

Write a detailed research report using this exact structure:

# {topic}

## Executive Summary
## Introduction
## Main Findings
### [Sub-task 1]
### [Sub-task 2]
### [Sub-task 3]
## Key Insights & Analysis
## Conclusion
## References

Rules:
- Cite sources inline using [Source Title]
- Ignore sources marked as [Scraping failed]
- Use markdown formatting
- Minimum 600 words
""")


def writer_agent(state: ResearchState) -> ResearchState:
    print(f"\n✍️  Writer Agent: Synthesizing report...")

    # Filter failed sources
    usable = [
        s for s in state.get("raw_sources", [])
        if "[Scraping failed" not in s.get("content", "")
    ]

    # ── Cap at 8 sources to stay within token limit ──────────
    usable = usable[:8]
    print(f"   Using {len(usable)} sources (capped to avoid token limit)")

    formatted_sources = "\n\n".join([
        f"### Source {i+1}: {s['title']}\n"
        f"Type: {s['source_type'].upper()}\n"
        f"URL: {s['url']}\n"
        f"Content:\n{s['content'][:800]}"  # limit each source to 800 chars
        for i, s in enumerate(usable)
    ])

    try:
        chain = WRITER_PROMPT | llm
        response = chain.invoke({
            "topic":    state["topic"],
            "plan":     "\n".join(state.get("plan", [])),
            "critique": state.get("critique", ""),
            "sources":  formatted_sources,
        })

        state["report"] = response.content
        state["status"] = "completed"
        print(f"Report written: ~{len(response.content.split())} words")

    except Exception as e:
        print(f"Writer error: {e}")
        state["error"] = str(e)
        state["status"] = "error"

    return state