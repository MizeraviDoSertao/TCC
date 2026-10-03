import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <a class="skip-link" href="#main-content">Pular para o conteúdo</a>
    <header class="app-header">
      <div class="header-inner">
        <a class="brand" routerLink="/" aria-label="Ir para o painel">
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M12 3 4.8 6v5.3c0 4.5 2.9 8.6 7.2 9.7 4.3-1.1 7.2-5.2 7.2-9.7V6L12 3Z"/><path d="m8.8 12 2.1 2.1 4.5-4.6"/></svg>
          </span>
          <span>
            <strong>Fraud<span>Guard</span></strong>
            <small>Central de inteligência</small>
          </span>
        </a>

        <nav aria-label="Navegação principal">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13h6V4H4v9Zm0 7h6v-4H4v4Zm10 0h6v-9h-6v9Zm0-16v4h6V4h-6Z"/></svg>
            Painel
          </a>
          <a routerLink="/imports" routerLinkActive="active">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v5h14v-5"/></svg>
            Analisar
          </a>
          <a routerLink="/claims" routerLinkActive="active">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4V5Zm4 4h8M8 13h5"/></svg>
            Sinistros
          </a>
          <a routerLink="/models" routerLinkActive="active">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 7v10l8 4 8-4V7l-8-4Zm-8 4 8 4 8-4M12 11v10"/></svg>
            Modelos
          </a>
        </nav>

        <div class="workspace-status" aria-label="Estado do ambiente">
          <i aria-hidden="true"></i>
          <span><small>Ambiente produtivo</small><strong>Operacional</strong></span>
        </div>
      </div>
    </header>

    <div id="main-content" tabindex="-1"><router-outlet></router-outlet></div>

    <footer class="app-footer">
      <span>FraudGuard · Inteligência de risco automotivo</span>
      <span>Pipeline auditável · Bronze → Silver → Gold</span>
    </footer>
  `
})
export class RootComponent {
}
