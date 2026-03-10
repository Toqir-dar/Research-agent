import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavbarComponent } from '../navbar/navbar';
import { ResearchService } from '../../services/research.service';
import { ResearchResult } from '../../models/research.model';

@Component({
  selector: 'app-research',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './research.html',
  styleUrl: './research.scss'
})
export class ResearchComponent implements OnInit, OnDestroy {
  topic     = '';
  jobId     = '';
  status    = 'idle';
  result: ResearchResult | null = null;
  error     = '';
  elapsed   = 0;
  private sub?: Subscription;
  private timer?: any;

  stages = [
    { key: 'queued',      label: 'Queued',      icon: '📋', desc: 'Job submitted...' },
    { key: 'running',     label: 'Planning',     icon: '🧠', desc: 'Planner breaking down topic...' },
    { key: 'researching', label: 'Researching',  icon: '🔍', desc: 'Gathering sources from web + ArXiv...' },
    { key: 'critiquing',  label: 'Critiquing',   icon: '🔎', desc: 'Critic reviewing source quality...' },
    { key: 'writing',     label: 'Writing',      icon: '✍️', desc: 'Writer synthesizing report...' },
    { key: 'completed',   label: 'Complete',     icon: '✅', desc: 'Report ready!' },
  ];

  constructor(
    private researchService: ResearchService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['topic']) {
        this.topic = params['topic'];
        this.startResearch();
      }
    });
  }

  startResearch() {
    if (this.topic.trim().length < 5) return;

    this.status  = 'loading';
    this.error   = '';
    this.result  = null;
    this.elapsed = 0;
    this.jobId   = '';

    // Start elapsed timer
    this.timer = setInterval(() => this.elapsed++, 1000);

    this.researchService.startResearch(this.topic).subscribe({
      next: (job) => {
        this.jobId  = job.job_id;
        this.status = 'running';
        this.pollJob();
      },
      error: (err) => {
        this.status = 'error';
        this.error  = err.message;
        clearInterval(this.timer);
      }
    });
  }

  private pollJob() {
    this.sub = this.researchService.pollResult(this.jobId).subscribe({
      next: (result) => {
        this.result = result;
        if (result.status === 'completed') {
          this.status = 'completed';
          clearInterval(this.timer);
        } else if (result.status === 'error') {
          this.status = 'error';
          this.error  = result.error || 'Unknown error';
          clearInterval(this.timer);
        }
      },
      error: (err) => {
        this.status = 'error';
        this.error  = err.message;
        clearInterval(this.timer);
      }
    });
  }

  viewReport() {
    this.router.navigate(['/report', this.jobId]);
  }

  reset() {
    this.sub?.unsubscribe();
    clearInterval(this.timer);
    this.status  = 'idle';
    this.topic   = '';
    this.jobId   = '';
    this.result  = null;
    this.error   = '';
    this.elapsed = 0;
  }

  get currentStageIndex(): number {
    if (this.status === 'completed') return 5;
    if (this.status === 'error')     return -1;
    if (this.status === 'running' && this.result) {
      if (this.elapsed < 15)  return 1;
      if (this.elapsed < 35)  return 2;
      if (this.elapsed < 50)  return 3;
      return 4;
    }
    return 0;
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    clearInterval(this.timer);
  }
}