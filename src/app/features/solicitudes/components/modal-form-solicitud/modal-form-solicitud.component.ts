import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Solicitud } from '../../../../core/models/solicitud.model';

@Component({
  selector: 'app-modal-form-solicitud',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Nombre</label>
        <input
          formControlName="nombre"
          type="text"
          class="w-full border rounded p-2"
          [class.border-red-500]="form.get('nombre')?.invalid && form.get('nombre')?.touched"
        />
        <div class="text-red-500 text-sm mt-1" *ngIf="form.get('nombre')?.invalid && form.get('nombre')?.touched">
          El nombre es requerido.
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Fecha</label>
        <input
          formControlName="fecha"
          type="date"
          class="w-full border rounded p-2"
          [class.border-red-500]="form.get('fecha')?.invalid && form.get('fecha')?.touched"
        />
        <div class="text-red-500 text-sm mt-1" *ngIf="form.get('fecha')?.invalid && form.get('fecha')?.touched">
          La fecha es requerida.
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Estado</label>
        <select
          formControlName="estado"
          class="w-full border rounded p-2"
        >
          <option value="">Seleccione</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobada">Aprobada</option>
          <option value="rechazada">Rechazada</option>
        </select>
        <div class="text-red-500 text-sm mt-1" *ngIf="form.get('estado')?.invalid && form.get('estado')?.touched">
          El estado es requerido.
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-4">
        <button type="button" (click)="cancel.emit()" class="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
          Cancelar
        </button>
        <button
          type="submit"
          [disabled]="loading || form.invalid"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {{ loading ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>
    </form>
  `
})
export class ModalFormSolicitudComponent {
  @Input() initialData: Partial<Solicitud> = {};
  @Input() loading = false;

  @Output() save = new EventEmitter<Solicitud>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      fecha: ['', Validators.required],
      estado: ['', Validators.required],
    });
  }

  ngOnInit() {
    if (this.initialData) {
      this.form.patchValue(this.initialData);
    }
  }

  submit() {
    if (this.form.valid) {
      this.save.emit(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
