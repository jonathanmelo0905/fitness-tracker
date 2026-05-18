import { Routes } from '@angular/router';

export const routes: Routes = [
  // ── Auth (outside tabs) ──────────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
  },

  // ── Tool detail pages (outside tabs, push navigation) ───────────────────
  {
    path: 'calculator',
    loadComponent: () => import('./pages/calculator/calculator.page').then(m => m.CalculatorPage),
  },
  {
    path: 'results',
    loadComponent: () => import('./pages/results/results.page').then(m => m.ResultsPage),
  },
  {
    path: 'physical-evaluation',
    loadComponent: () => import('./pages/physical-evaluation/physical-evaluation.page').then(m => m.PhysicalEvaluationPage),
  },
  {
    path: 'physical-evaluation-results',
    loadComponent: () => import('./pages/physical-evaluation-results/physical-evaluation-results.page').then(m => m.PhysicalEvaluationResultsPage),
  },

  // ── Tab shell ────────────────────────────────────────────────────────────
  {
    path: '',
    loadComponent: () => import('./pages/tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'clientes',
        loadComponent: () => import('./pages/clientes/clientes.page').then(m => m.ClientesPage),
      },
      {
        path: 'herramientas',
        loadComponent: () => import('./pages/herramientas/herramientas.page').then(m => m.HerramientasPage),
      },
      {
        path: 'agenda',
        loadComponent: () => import('./pages/agenda/agenda.page').then(m => m.AgendaPage),
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage),
      },
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
      },
      {
        path: '',
        redirectTo: 'clientes',
        pathMatch: 'full',
      },
    ],
  },
];
