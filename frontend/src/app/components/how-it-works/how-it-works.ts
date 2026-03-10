import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './how-it-works.html',
  styleUrl: './how-it-works.scss'
})
export class HowItWorksComponent {
  agents = [
    {
      icon: '🧠', name: 'Planner Agent', color: '#1A56DB',
      input: 'User topic',
      output: 'Research plan + search queries',
      desc: 'Calls Groq Llama 3.3 70B to decompose the topic into 3–5 focused sub-tasks and generates targeted search queries for each. Ensures the research is structured before any searching begins.',
      tools: ['Groq API', 'Llama 3.3 70B'],
    },
    {
      icon: '🔍', name: 'Researcher Agent', color: '#0E9F6E',
      input: 'Search queries',
      output: '9+ sources (web + academic)',
      desc: 'Executes parallel web searches via DuckDuckGo, scrapes page content using BeautifulSoup, and fetches academic papers from ArXiv. Uses thread pooling for 8x faster scraping.',
      tools: ['DuckDuckGo', 'BeautifulSoup', 'ArXiv API'],
    },
    {
      icon: '🔎', name: 'Critic Agent', color: '#E3A008',
      input: 'Gathered sources',
      output: 'Quality verdict + feedback',
      desc: 'Reviews all gathered sources against three criteria: sufficient quantity, presence of academic sources, and coverage of all sub-tasks. If gaps are found, it loops the Researcher back for more — up to 2 iterations.',
      tools: ['Groq API', 'LangGraph conditional edges'],
    },
    {
      icon: '✍️', name: 'Writer Agent', color: '#7E3AF2',
      input: 'Sources + plan + critique',
      output: '900–1200 word report',
      desc: 'Synthesizes all usable sources into a structured Markdown report with Executive Summary, Introduction, Main Findings, Key Insights, Conclusion, and References. Filters failed sources automatically.',
      tools: ['Groq API', 'Llama 3.3 70B'],
    },
  ];

  techStack = [
    { name: 'LangGraph',   desc: 'Agent orchestration & state machine', tag: 'Python' },
    { name: 'Groq API',    desc: 'Free LLM inference (Llama 3.3 70B)',  tag: 'Free' },
    { name: 'DuckDuckGo',  desc: 'Web search — no API key needed',       tag: 'Free' },
    { name: 'ArXiv API',   desc: 'Academic paper search',                tag: 'Free' },
    { name: 'FastAPI',     desc: 'Python REST API server',               tag: 'Python' },
    { name: 'Express.js',  desc: 'Node.js backend middleware',           tag: 'Node' },
    { name: 'Angular 21',  desc: 'Frontend framework with SSR',          tag: 'TypeScript' },
  ];
}