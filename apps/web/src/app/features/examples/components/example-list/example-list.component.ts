import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'feature-example-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
      <h1>Examples - Lista</h1>
      <p>Placeholder da lista de exemplos.</p>
    </section>
  `,
})
export class ExampleListComponent {}


