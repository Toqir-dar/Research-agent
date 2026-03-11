# main.py  — CLI entry point
import sys
import os
import argparse
from core.graph import run_research


def main():
    parser = argparse.ArgumentParser(
        description="Autonomous Research Agent — powered by Groq + LangGraph"
    )
    parser.add_argument(
        "--topic",
        type=str,
        required=True,
        help="Research topic to investigate"
    )
    parser.add_argument(
        "--save",
        action="store_true",
        help="Save report to outputs/ folder"
    )
    args = parser.parse_args()

    if not os.environ.get("GROQ_API_KEY"):
        print("GROQ_API_KEY not set. Add it to your .env file.")
        sys.exit(1)

    # Run the full pipeline
    final_state = run_research(args.topic)

    # Print report
    print("\n" + "=" * 50)
    print("FINAL REPORT")
    print("=" * 50)
    print(final_state.get("report", "No report generated."))

    # Optionally save
    if args.save:
        os.makedirs("outputs", exist_ok=True)
        safe = args.topic.replace(" ", "_").replace("/", "-")[:50]
        path = f"outputs/{safe}_report.md"
        with open(path, "w", encoding="utf-8") as f:
            f.write(final_state["report"])
        print(f"\nReport saved to: {path}")


if __name__ == "__main__":
    main()