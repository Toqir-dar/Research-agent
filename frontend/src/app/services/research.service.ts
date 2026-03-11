// services/research.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer, of } from 'rxjs';
import { switchMap, takeWhile, catchError, filter } from 'rxjs/operators';
import { ResearchRequest, JobStatus, ResearchResult } from '../models/research.model';

@Injectable({ providedIn: 'root' })
export class ResearchService {

  private readonly API = 'https://toqir12-research-agent-backend.hf.space/api';

  constructor(private http: HttpClient) { }

  startResearch(topic: string): Observable<JobStatus> {
    return this.http
      .post<JobStatus>(`${this.API}/research`, { topic })
      .pipe(catchError(this.handleError));
  }

  getResult(jobId: string): Observable<ResearchResult> {
    return this.http
      .get<ResearchResult>(`${this.API}/research/${jobId}`)
      .pipe(catchError(this.handleError));
  }

  pollResult(jobId: string): Observable<ResearchResult> {
    return timer(0, 3000).pipe(
      switchMap(() =>
        this.getResult(jobId).pipe(
          catchError(() => of(null))  // swallow errors — keep polling
        )
      ),
      filter(result => result !== null),
      takeWhile(
        result => result!.status !== 'completed' && result!.status !== 'error',
        true
      ),
    );
  }

  deleteJob(jobId: string): Observable<any> {
    return this.http
      .delete(`${this.API}/research/${jobId}`)
      .pipe(catchError(this.handleError));
  }

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