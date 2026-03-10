# 🔬 Autonomous Research Agent

> A self-correcting multi-agent AI pipeline that plans, searches, critiques, and writes research reports — fully automated in ~30 seconds.

Built for students who spend hours hunting for sources instead of actually thinking and writing. This tool automates the entire research discovery phase so you can focus on understanding and analysis.

---

## 📌 The Problem

Students waste the majority of their research time on **search, not thinking**:

- Open 10 tabs → skim abstracts → check relevance → repeat
- No quality control on sources
- No academic papers mixed in with web results
- Starts over from scratch every time

This project fixes that with a **4-agent AI pipeline** that handles the entire process autonomously.

---

## ✨ How It Works

```
User enters topic
      ↓
🧠 Planner Agent     → breaks topic into sub-tasks + search queries
      ↓
🔍 Researcher Agent  → searches web (DDG) + ArXiv papers in parallel
      ↓
🔎 Critic Agent      → evaluates source quality → loops back if needed (max 2x)
      ↓
✍️  Writer Agent     → synthesizes 800–1000 word structured Markdown report
      ↓
📄 Report delivered to frontend
```

The **Critic-in-the-loop** is the key innovation — most AI tools do one-shot retrieval. This one self-evaluates and re-searches if sources aren't good enough.

---

## 🏗️ Architecture

```
Angular (4200)  →  Express (3000)  →  FastAPI (8000)  →  LangGraph Pipeline
```

| Layer | Tech | Purpose |
|---|---|---|
| Frontend | Angular 21 | Live pipeline tracker + Markdown report viewer |
| Backend | Express.js 5 | Validation, CORS, ML API abstraction |
| ML Core | FastAPI + LangGraph | Async job queue + 4-agent pipeline |
| LLM | Groq (Llama 3.3 70B) | Free, fast inference (~2s responses) |
| Search | DuckDuckGo (ddgs) | Web search — no API key needed |
| Academic | ArXiv API | Scholarly papers — no API key needed |

**100% free APIs. No paid subscriptions required.**

---

## 📁 Project Structure

```
research-agent/
├── ml/                          # Python ML Core
│   ├── agents/
│   │   ├── planner_agent.py     # Breaks topic into sub-tasks
│   │   ├── researcher_agent.py  # Parallel web + ArXiv search
│   │   ├── critic_agent.py      # Source quality evaluation
│   │   └── writer_agent.py      # Report synthesis
│   ├── core/
│   │   ├── config.py            # Groq API key, model, limits
│   │   ├── graph.py             # LangGraph pipeline definition
│   │   ├── llm.py               # ChatGroq factory
│   │   └── state.py             # ResearchState TypedDict
│   ├── tools/
│   │   ├── search_tool.py       # DuckDuckGo search
│   │   ├── scraper_tool.py      # BeautifulSoup scraper
│   │   └── arxiv_tool.py        # ArXiv academic papers
│   ├── api/
│   │   └── server.py            # FastAPI async job queue
│   └── requirements.txt
│
├── backend/                     # Express.js Middleware
│   ├── src/
│   │   ├── app.js               # Entry point + CORS
│   │   ├── routes/
│   │   │   └── research.routes.js
│   │   ├── controllers/
│   │   │   └── research.controller.js
│   │   ├── services/
│   │   │   └── ml.service.js    # Axios client to FastAPI
│   │   └── middleware/
│   │       ├── validate.js      # Input validation
│   │       └── errorHandler.js  # Global error handler
│   ├── .env
│   └── package.json
│
└── frontend/                    # Angular 21 SPA
    ├── src/app/
    │   ├── components/
    │   │   ├── home/            # Hero + search input
    │   │   ├── research/        # Live pipeline tracker
    │   │   ├── report/          # Markdown report viewer
    │   │   ├── how-it-works/    # Agent pipeline explanation
    │   │   ├── about/           # Project info
    │   │   └── navbar/          # Navigation
    │   ├── services/
    │   │   └── research.service.ts  # RxJS polling
    │   └── models/
    │       └── research.model.ts    # TypeScript interfaces
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- A free [Groq API key](https://console.groq.com)

---

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/research-agent.git
cd research-agent
```

---

### 2. Start the ML Core (FastAPI)

```bash
cd ml

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo GROQ_API_KEY=your_key_here > .env

# Start server
uvicorn api.server:app --reload --port 8000
```

✅ FastAPI running at `http://localhost:8000`

---

### 3. Start the Express Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
echo PORT=3000 > .env
echo ML_API_URL=http://localhost:8000 >> .env
echo NODE_ENV=development >> .env

# Start server
npm run dev
```

✅ Express running at `http://localhost:3000`

---

### 4. Start the Angular Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
ng serve
```

✅ Angular running at `http://localhost:4200`

---

### 5. Open the app

Navigate to **http://localhost:4200**, enter any research topic, and watch the pipeline run live.

---

## 🔌 API Reference

### FastAPI `:8000`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/research` | Start a research job → returns `job_id` |
| GET | `/research/{job_id}` | Poll job status and result |
| DELETE | `/research/{job_id}` | Delete a job |
| GET | `/jobs` | List all jobs |

### Express `:3000`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Express + ML API health |
| POST | `/api/research` | Validated → forwarded to FastAPI |
| GET | `/api/research/:jobId` | Proxied poll |
| DELETE | `/api/research/:jobId` | Cleanup |
| GET | `/api/jobs` | Debug: list all jobs |

---

## 🧠 LangGraph State

The shared state object that flows through all agents:

```python
class ResearchState(TypedDict):
    topic:                str           # User input
    plan:                 List[str]     # Planner output: sub-tasks
    search_queries:       List[str]     # Planner output: search queries
    raw_sources:          List[dict]    # Researcher output: scraped content
    critique:             str           # Critic output: quality review
    needs_more_research:  bool          # Critic decision: loop or proceed
    iteration:            int           # Loop counter (max 2)
    report:               str           # Writer output: final Markdown
    status:               str           # Pipeline status
    error:                str | None    # Error message if failed
```

---

## ⚙️ Configuration

Edit `ml/core/config.py` to tune the pipeline:

```python
GROQ_MODEL = "llama-3.3-70b-versatile"  # LLM model
MAX_SEARCH_RESULTS = 5                   # Results per DDG query
MAX_SCRAPE_CHARS = 3000                  # Characters per scraped page
MAX_SOURCES_FOR_WRITER = 8              # Sources sent to Writer (token limit)
```

---

## 🌐 Deployment

| Service | Platform | Cost |
|---|---|---|
| Angular frontend | Vercel | Free |
| Express backend | Render | Free |
| FastAPI ML core | Render | Free |

See [Deployment Guide](#) for step-by-step instructions.

> **Note:** Free Render services sleep after 15 minutes of inactivity. First request after sleep takes ~30 seconds to wake up.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Agent Orchestration | LangGraph |
| LLM | Groq API — Llama 3.3 70B |
| LLM Framework | LangChain |
| Web Search | DuckDuckGo (ddgs) |
| Academic Search | ArXiv API |
| Web Scraping | BeautifulSoup4 |
| ML API | FastAPI + Uvicorn |
| Backend | Express.js 5 + Axios |
| Frontend | Angular 21 + RxJS |
| Styling | SCSS + Google Fonts |
| Markdown | marked.js |

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first.

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m "add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 👤 Author

Built by **[Your Name]**

- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/YOUR_PROFILE)

---

> *"Research should be about ideas — not browser tabs."*
