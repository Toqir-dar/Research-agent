// services/research.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { switchMap, takeWhile, catchError, map } from 'rxjs/operators';
import { ResearchRequest, JobStatus, ResearchResult } from '../models/research.model';

@Injectable({ providedIn: 'root' })
export class ResearchService {

  private readonly API = '/api';   // proxied to Express :3000

  constructor(private http: HttpClient) {}

  /**
   * Starts a new research job
   * POST /api/research
   */
  startResearch(topic: string): Observable<JobStatus> {
    return this.http
      .post<JobStatus>(`${this.API}/research`, { topic })
      .pipe(catchError(this.handleError));
  }

  /**
   * Gets the current status/result of a job
   * GET /api/research/:jobId
   */
  getResult(jobId: string): Observable<ResearchResult> {
    return this.http
      .get<ResearchResult>(`${this.API}/research/${jobId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Polls every 5 seconds until job is completed or errored
   */
  pollResult(jobId: string): Observable<ResearchResult> {
    return timer(0, 5000).pipe(
      switchMap(() => this.getResult(jobId)),
      takeWhile(
        result => result.status !== 'completed' && result.status !== 'error',
        true   // emit the final completed/error value too
      ),
      catchError(this.handleError)
    );
  }

  /**
   * Deletes a job from memory
   * DELETE /api/research/:jobId
   */
  deleteJob(jobId: string): Observable<any> {
    return this.http
      .delete(`${this.API}/research/${jobId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Health check
   */
  checkHealth(): Observable<any> {
    return this.http
      .get(`${this.API}/health`)
      .pipe(catchError(this.handleError));
  }

  private handleError(err: HttpErrorResponse) {
    const message = err.error?.error || err.message || 'Unknown error';
    return throwError(() => new Error(message));
  }
}