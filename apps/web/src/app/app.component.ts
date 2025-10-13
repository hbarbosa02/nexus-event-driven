import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { MainLayoutComponent } from "@/app/layouts/main-layout/main-layout.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, MainLayoutComponent],
  template: `
    <app-main-layout>
      <router-outlet></router-outlet>
    </app-main-layout>
  `,
  styles: [],
})
export class AppComponent {
  title = "Nexus Event Driven";
}
