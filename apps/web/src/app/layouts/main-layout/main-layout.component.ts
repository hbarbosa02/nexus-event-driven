import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { HeaderComponent } from "@/app/shared/components/header/header.component";
import { FooterComponent } from "@/app/shared/components/footer/footer.component";

@Component({
  selector: "app-main-layout",
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  template: `
    <div class="main-layout">
      <app-header></app-header>
      <main class="main-content">
        <ng-content></ng-content>
      </main>
      <app-footer></app-footer>
    </div>
  `,
  styleUrls: ["./main-layout.component.scss"],
})
export class MainLayoutComponent {}
