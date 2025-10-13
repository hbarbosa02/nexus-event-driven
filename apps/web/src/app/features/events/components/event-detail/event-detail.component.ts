import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'feature-event-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
      <h1>Events - Detalhe</h1>
      <p>Placeholder do detalhe do event.</p>
    </section>
  `,
})
export class EventDetailComponent {}


