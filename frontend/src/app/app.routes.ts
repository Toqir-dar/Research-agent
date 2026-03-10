// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/home/home').then(m => m.HomeComponent)
  },
  {
    path: 'how-it-works',
    loadComponent: () =>
      import('./components/how-it-works/how-it-works').then(m => m.HowItWorksComponent)
  },
  {
    path: 'research',
    loadComponent: () =>
      import('./components/research/research').then(m => m.ResearchComponent)
  },
  {
    path: 'report/:jobId',
    loadComponent: () =>
      import('./components/report/report').then(m => m.ReportComponent)
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./components/about/about').then(m => m.AboutComponent)
  },
  { path: '**', redirectTo: '' }
];