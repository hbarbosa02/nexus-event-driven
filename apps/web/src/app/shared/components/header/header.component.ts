import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <a routerLink="/home">
              <h1>Nexus Event Driven</h1>
            </a>
          </div>

          <nav class="nav">
            <ul class="nav-list">
              <li class="nav-item">
                <a
                  routerLink="/home"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{ exact: true }">
                  Home
                </a>
              </li>
              <li class="nav-item">
                <a
                  routerLink="/events"
                  routerLinkActive="active">
                  Events
                </a>
              </li>
              <li class="nav-item">
                <a
                  routerLink="/examples"
                  routerLinkActive="active">
                  Examples
                </a>
              </li>
              <li class="nav-item">
                <a
                  routerLink="/doc"
                  routerLinkActive="active">
                  Documentation
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  `,
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent {}
