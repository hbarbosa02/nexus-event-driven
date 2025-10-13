import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'feature-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section>
      <h1>Events - Formulário</h1>
      <form [formGroup]="form">
        <label>
          Título
          <input type="text" formControlName="title" />
        </label>
      </form>
      <pre>{{ form.value | json }}</pre>
    </section>
  `,
})
export class EventFormComponent {
  form = new FormGroup({ title: new FormControl('') });
}


