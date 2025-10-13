import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { MarkdownModule } from "ngx-markdown";
import { DocService, DocSection } from "@/app/core/services/doc.service";

@Component({
  selector: "app-doc",
  standalone: true,
  imports: [CommonModule, RouterModule, MarkdownModule],
  template: `
    <div class="doc-page">
      <div class="container">
        <div class="doc-layout">
          <aside class="doc-sidebar">
            <nav class="doc-nav">
              <h3>Documentação</h3>
              <ul>
                <li *ngFor="let section of sections">
                  <a
                    [routerLink]="['/doc', section.id]"
                    [class.active]="currentSection?.id === section.id">
                    {{ section.title }}
                  </a>
                </li>
              </ul>
            </nav>
          </aside>

          <main class="doc-content">
            <div
              *ngIf="loading"
              class="loading">
              <div class="spinner"></div>
            </div>

            <div
              *ngIf="!loading && currentSection"
              class="doc-section">
              <h1>{{ currentSection.title }}</h1>
              <markdown [data]="currentSection.content"></markdown>
            </div>

            <div
              *ngIf="!loading && !currentSection"
              class="doc-welcome">
              <h1>Documentação</h1>
              <p>Selecione uma seção da documentação para começar.</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  `,
  styleUrls: ["./doc.component.scss"],
})
export class DocComponent implements OnInit {
  sections: DocSection[] = [];
  currentSection: DocSection | null = null;
  loading = false;

  constructor(private docService: DocService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.loadSections();
    this.route.params.subscribe((params) => {
      const sectionId = params["section"];
      if (sectionId) {
        this.loadSection(sectionId);
      }
    });
  }

  private loadSections(): void {
    this.docService.getDocSections().subscribe({
      next: (sections) => {
        this.sections = sections;
      },
      error: (error) => {
        console.error("Error loading sections:", error);
      },
    });
  }

  private loadSection(id: string): void {
    this.loading = true;
    this.docService.getDocSection(id).subscribe({
      next: (section) => {
        this.currentSection = section;
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading section:", error);
        this.loading = false;
      },
    });
  }
}
