import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'feature-event-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
      <h1>Events - Lista</h1>
      <p>Placeholder da lista de events.</p>
    </section>
  `,
})
export class EventListComponent {}


