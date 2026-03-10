import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {
  topic = '';

  exampleTopics = [
    'Impact of AI on software engineering',
    'LSTM models for stock market forecasting',
    'Blockchain in supply chain management',
    'Quantum computing in cryptography',
    'Climate change and renewable energy',
  ];
  steps = [
  { icon: '🧠', title: 'Planner',    desc: 'Breaks your topic into focused sub-tasks and generates targeted search queries.' },
  { icon: '🔍', title: 'Researcher', desc: 'Searches the web via DuckDuckGo and pulls academic papers from ArXiv.' },
  { icon: '🔎', title: 'Critic',     desc: 'Reviews gathered sources for quality and triggers a self-correction loop if needed.' },
  { icon: '✍️', title: 'Writer',     desc: 'Synthesizes all sources into a structured, cited research report.' },
];

  constructor(private router: Router) {}

  startResearch() {
    if (this.topic.trim().length >= 5) {
      this.router.navigate(['/research'], {
        queryParams: { topic: this.topic.trim() }
      });
    }
  }

  useTopic(topic: string) {
    this.topic = topic;
  }
}