import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar';
import { ResearchService } from '../../services/research.service';
import { ResearchResult } from '../../models/research.model';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterLink],
  templateUrl: './report.html',
  styleUrl: './report.scss'
})
export class ReportComponent implements OnInit {
  result: ResearchResult | null = null;
  reportHtml: SafeHtml = '';
  loading = true;
  error   = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private researchService: ResearchService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    const jobId = this.route.snapshot.paramMap.get('jobId');
    if (!jobId) { this.router.navigate(['/research']); return; }

    this.researchService.getResult(jobId).subscribe({
      next: (result) => {
        this.result  = result;
        this.loading = false;
        if (result.report) {
          const html = marked.parse(result.report) as string;
          this.reportHtml = this.sanitizer.bypassSecurityTrustHtml(html);
        }
      },
      error: (err) => {
        this.error   = err.message;
        this.loading = false;
      }
    });
  }

  downloadMarkdown() {
    if (!this.result?.report) return;
    const blob = new Blob([this.result.report], { type: 'text/markdown' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${this.result.topic.slice(0,40).replace(/\s+/g,'-')}-report.md`;
    a.click();
    URL.revokeObjectURL(url);
  }
}