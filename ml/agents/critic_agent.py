# agents/critic_agent.py
import json
from langchain.prompts import ChatPromptTemplate
from core.llm import get_llm
from core.state import ResearchState

llm = get_llm(temperature=0.2)  # Low temp = more consistent evaluation

CRITIC_PROMPT = ChatPromptTemplate.from_template("""
You are a critical research reviewer. Evaluate whether the gathered sources
are sufficient to write a comprehensive report on the given topic.

Topic: {topic}

Research Plan (sub-tasks that must be covered):
{plan}

Sources gathered ({num_sources} total):
{source_summaries}

Evaluate strictly against these criteria:
1. Are there at least 4 usable sources? (ignore failed/403 sources)
2. Do the sources collectively cover the main sub-tasks in the plan?
3. Is there at least 1 academic/ArXiv source?

Respond ONLY with valid JSON — no explanation, no markdown fences:
{{
  "needs_more_research": true or false,
  "critique": "2-3 sentences explaining your evaluation",
  "coverage": {{
    "sufficient_sources": true or false,
    "has_academic_source": true or false,
    "covers_all_subtasks": true or false
  }}
}}
""")


def critic_agent(state: ResearchState) -> ResearchState:
    print(f"\n🔎 Critic Agent: Reviewing {len(state.get('raw_sources', []))} sources...")
    print(f"   Current iteration: {state.get('iteration', 0)}")

    # Hard cap — force proceed after 2 iterations regardless
    if state.get("iteration", 0) >= 2:
        print("   ⚠️  Max iterations reached — forcing Writer")
        state["needs_more_research"] = False
        state["critique"] = "Max iterations reached. Proceeding with available sources."
        state["status"] = "critiqued"
        return state

    sources = state.get("raw_sources", [])
    source_summaries = "\n".join([
        f"- [{s['source_type'].upper()}] {s['title'][:60]}: "
        f"{s['content'][:150].replace(chr(10), ' ')}..."
        for s in sources
        if "[Scraping failed" not in s.get("content", "")
    ])

    if not source_summaries:
        source_summaries = "No usable sources found."

    try:
        chain = CRITIC_PROMPT | llm
        response = chain.invoke({
            "topic":            state["topic"],
            "plan":             "\n".join(state.get("plan", [])),
            "num_sources":      len(sources),
            "source_summaries": source_summaries,
        })

        raw = response.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(raw)

        state["needs_more_research"] = parsed["needs_more_research"]
        state["critique"] = parsed["critique"]
        state["status"] = "critiqued"

        coverage = parsed.get("coverage", {})
        print(f"   📊 Sufficient sources : {coverage.get('sufficient_sources')}")
        print(f"   📊 Has academic source: {coverage.get('has_academic_source')}")
        print(f"   📊 Covers all subtasks: {coverage.get('covers_all_subtasks')}")
        print(f"   💬 Critique: {state['critique'][:100]}...")

        if state["needs_more_research"]:
            print(f"   🔁 Decision: Needs more research")
        else:
            print(f"   ✅ Decision: Sources sufficient — proceeding to Writer")

    except json.JSONDecodeError as e:
        print(f"⚠️  JSON parse error: {e} — defaulting to sufficient")
        state["needs_more_research"] = False
        state["critique"] = "Could not parse critique — proceeding with available sources."
        state["status"] = "critiqued_fallback"

    except Exception as e:
        print(f"❌ Critic error: {e}")
        state["needs_more_research"] = False
        state["error"] = str(e)
        state["status"] = "error"

    return state