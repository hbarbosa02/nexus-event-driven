import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-page">
      <div class="container">
        <div class="hero">
          <h1>Bem-vindo ao Nexus Event Driven</h1>
          <p class="hero-subtitle">
            Sistema de gerenciamento de eventos nativos do Node.js com retry
            automático e monitoramento completo.
          </p>

          <div class="hero-actions">
            <a
              routerLink="/events"
              class="btn btn-primary"
              >Gerenciar Events</a
            >
            <a
              routerLink="/examples"
              class="btn btn-secondary"
              >Ver Exemplos</a
            >
            <a
              routerLink="/doc"
              class="btn btn-outline"
              >Documentação</a
            >
          </div>
        </div>

        <div class="features">
          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon">⚡</div>
              <h3>EventEmitter Nativo</h3>
              <p>
                Gerenciamento completo de eventos nativos do Node.js com
                EventEmitter.
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">🔄</div>
              <h3>Retry Automático</h3>
              <p>
                Sistema de retry automático com até 5 tentativas e cancelamento
                inteligente.
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">📊</div>
              <h3>Monitoramento</h3>
              <p>
                Acompanhe o status, erros e histórico completo de todos os
                eventos.
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">🏗️</div>
              <h3>Arquitetura Moderna</h3>
              <p>
                NestJS + Angular v20.2 com padrões de desenvolvimento robustos.
              </p>
            </div>
          </div>
        </div>

        <div class="stats">
          <div class="stat-item">
            <div class="stat-number">{{ stats.totalEvents }}</div>
            <div class="stat-label">Total de Events</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.successfulEvents }}</div>
            <div class="stat-label">Events Bem-sucedidos</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.failedEvents }}</div>
            <div class="stat-label">Events com Erro</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.pendingEvents }}</div>
            <div class="stat-label">Events Pendentes</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent {
  stats = {
    totalEvents: 0,
    successfulEvents: 0,
    failedEvents: 0,
    pendingEvents: 0,
  };
}
