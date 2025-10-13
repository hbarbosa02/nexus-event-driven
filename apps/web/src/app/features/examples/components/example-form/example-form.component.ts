import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'feature-example-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section>
      <h1>Examples - Formulário</h1>
      <form [formGroup]="form">
        <label>
          Nome
          <input type="text" formControlName="name" />
        </label>
      </form>
      <pre>{{ form.value | json }}</pre>
    </section>
  `,
})
export class ExampleFormComponent {
  form = new FormGroup({ name: new FormControl('') });
}


