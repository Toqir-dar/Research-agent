# core/graph.py
from langgraph.graph import StateGraph, END
from core.state import ResearchState
from agents.planner_agent import planner_agent
from agents.researcher_agent import researcher_agent
from agents.critic_agent import critic_agent
from agents.writer_agent import writer_agent


def should_continue_research(state: ResearchState) -> str:
    iteration = state.get("iteration", 0)
    needs_more = state.get("needs_more_research", False)

    print(f"\n🔀 Router check: needs_more={needs_more}, iteration={iteration}")

    if needs_more and iteration < 2:
        return "increment"
    return "writer"


def increment_node(state: ResearchState) -> ResearchState:
    new_iter = state.get("iteration", 0) + 1
    print(f"⬆️  Incrementing iteration: {state.get('iteration', 0)} → {new_iter}")
    return {
        **state,
        "iteration": new_iter,
        "needs_more_research": False,  # reset flag
    }


def build_graph() -> StateGraph:
    graph = StateGraph(ResearchState)

    graph.add_node("planner",    planner_agent)
    graph.add_node("researcher", researcher_agent)
    graph.add_node("critic",     critic_agent)
    graph.add_node("increment",  increment_node)
    graph.add_node("writer",     writer_agent)

    graph.set_entry_point("planner")
    graph.add_edge("planner",    "researcher")
    graph.add_edge("researcher", "critic")

    graph.add_conditional_edges(
        "critic",
        should_continue_research,
        {
            "increment": "increment",
            "writer":    "writer",
        }
    )

    graph.add_edge("increment", "researcher")
    graph.add_edge("writer",    END)

    return graph.compile()


def run_research(topic: str) -> ResearchState:
    app = build_graph()

    initial_state: ResearchState = {
        "topic":               topic,
        "plan":                None,
        "search_queries":      None,
        "raw_sources":         None,
        "critique":            None,
        "needs_more_research": False,
        "report":              None,
        "iteration":           0,
        "status":              "starting",
        "error":               None,
    }

    print(f"\n{'='*50}")
    print(f"🚀 Starting Research Pipeline")
    print(f"   Topic: {topic}")
    print(f"{'='*50}")

    final_state = app.invoke(
        initial_state,
        config={"recursion_limit": 15}
    )

    print(f"\n{'='*50}")
    print(f"🏁 Pipeline Complete!")
    print(f"   Status    : {final_state['status']}")
    print(f"   Sources   : {len(final_state.get('raw_sources', []))}")
    print(f"   Iterations: {final_state.get('iteration', 0)}")
    words = len(final_state.get('report', '').split()) if final_state.get('report') else 0
    print(f"   Words     : ~{words}")
    print(f"{'='*50}\n")

    return final_state