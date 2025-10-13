import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'feature-example-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
      <h1>Examples - Detalhe</h1>
      <p>Placeholder do detalhe do exemplo.</p>
    </section>
  `,
})
export class ExampleDetailComponent {}


