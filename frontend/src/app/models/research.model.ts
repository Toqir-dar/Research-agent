// models/research.model.ts

export interface ResearchRequest {
  topic: string;
}

export interface JobStatus {
  job_id:       string;
  status:       'queued' | 'running' | 'completed' | 'error';
  topic:        string;
  created_at:   string;
  completed_at: string | null;
  error:        string | null;
}

export interface ResearchResult extends JobStatus {
  plan:           string[]      | null;
  search_queries: string[]      | null;
  sources_count:  number;
  critique:       string        | null;
  report:         string        | null;
  word_count:     number;
  iterations:     number;
}

export type PipelineStage =
  | 'idle'
  | 'queued'
  | 'planning'
  | 'researching'
  | 'critiquing'
  | 'writing'
  | 'completed'
  | 'error';