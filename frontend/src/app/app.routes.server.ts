import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'research',      renderMode: RenderMode.Client },
  { path: 'report/:jobId', renderMode: RenderMode.Client },
  { path: '**',            renderMode: RenderMode.Prerender },
];