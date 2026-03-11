# agents/planner_agent.py
import json
from langchain.prompts import ChatPromptTemplate
from core.llm import get_llm
from core.state import ResearchState

llm = get_llm(temperature=0.4)

PLANNER_PROMPT = ChatPromptTemplate.from_template("""
You are a strategic research planner. Given a research topic, your job is to:
1. Break it down into 3-5 focused sub-tasks
2. Generate specific search queries for each sub-task
3. Generate 1 academic query for ArXiv

Topic: {topic}

Respond ONLY with valid JSON — no explanation, no markdown fences:
{{
  "plan": [
    "Sub-task 1: description",
    "Sub-task 2: description",
    "Sub-task 3: description"
  ],
  "search_queries": [
    "specific web search query 1",
    "specific web search query 2",
    "specific web search query 3",
    "academic arxiv search query"
  ]
}}
""")


def planner_agent(state: ResearchState) -> ResearchState:
    """
    Planner Agent:
    - Input:  state['topic']
    - Output: state['plan'], state['search_queries'], state['status']
    """
    print(f"\nPlanner Agent: Planning '{state['topic']}'...")

    try:
        chain = PLANNER_PROMPT | llm
        response = chain.invoke({"topic": state["topic"]})

        # Clean response — strip markdown fences if model adds them
        raw = response.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()

        parsed = json.loads(raw)

        state["plan"] = parsed["plan"]
        state["search_queries"] = parsed["search_queries"]
        state["status"] = "planned"

        print(f"Plan created: {len(state['plan'])} tasks")
        print(f"Queries generated: {len(state['search_queries'])}")
        for i, task in enumerate(state["plan"], 1):
            print(f"   Task {i}: {task}")

    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        print(f"   Raw response: {response.content[:200]}")
        # Graceful fallback
        state["plan"] = [f"Research {state['topic']} comprehensively"]
        state["search_queries"] = [
            state["topic"],
            f"{state['topic']} research 2024",
            f"{state['topic']} latest findings",
            f"{state['topic']} academic study",
        ]
        state["status"] = "planned_fallback"

    except Exception as e:
        print(f"Planner error: {e}")
        state["error"] = str(e)
        state["status"] = "error"

    return state