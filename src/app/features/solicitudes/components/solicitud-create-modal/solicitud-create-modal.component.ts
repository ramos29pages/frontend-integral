// components/modal-creacion/modal-creacion.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-modal-creacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  template: `
    <div *ngIf="mostrar"
         class="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-blue-800">Nueva Solicitud</h2>
            <button (click)="onCerrar()" class="text-gray-500 hover:text-gray-700">
              <fa-icon [icon]="faTimes"></fa-icon>
            </button>
          </div>

          <form [formGroup]="solicitudForm" (ngSubmit)="onSubmit()">
            <!-- Campos de cliente y email -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label class="block text-gray-700 font-medium mb-2">Cliente</label>
                <input formControlName="cliente"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-300"
                  [class.border-red-500]="solicitudForm.get('cliente')?.invalid && solicitudForm.get('cliente')?.touched">
                <div *ngIf="solicitudForm.get('cliente')?.invalid && solicitudForm.get('cliente')?.touched"
                  class="text-red-500 text-sm mt-1">
                  Nombre requerido
                </div>
              </div>

              <div>
                <label class="block text-gray-700 font-medium mb-2">Email Cliente</label>
                <input formControlName="email_cliente" type="email"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-300"
                  [class.border-red-500]="solicitudForm.get('email_cliente')?.invalid && solicitudForm.get('email_cliente')?.touched">
                <div *ngIf="solicitudForm.get('email_cliente')?.invalid && solicitudForm.get('email_cliente')?.touched"
                  class="text-red-500 text-sm mt-1">
                  Email válido requerido
                </div>
              </div>
            </div>

            <!-- Observaciones -->
            <div class="mb-6">
              <label class="block text-gray-700 font-medium mb-2">Observaciones</label>
              <textarea formControlName="observaciones" rows="4"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-300"
                [class.border-red-500]="solicitudForm.get('observaciones')?.invalid && solicitudForm.get('observaciones')?.touched">
              </textarea>
              <div *ngIf="solicitudForm.get('observaciones')?.invalid && solicitudForm.get('observaciones')?.touched"
                class="text-red-500 text-sm mt-1">
                Máximo 500 caracteres
              </div>
            </div>

            <!-- Servicios -->
            <div formArrayName="servicios">
              <div *ngFor="let servicio of servicios.controls; let i=index" [formGroupName]="i"
                class="bg-blue-50 p-4 rounded-lg mb-4 relative">
                <h3 class="font-bold text-blue-800 mb-3">Servicio #{{i + 1}}</h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Nombre del servicio -->
                  <div>
                    <label class="block text-gray-700 font-medium mb-2">Nombre del Servicio</label>
                    <input formControlName="nombre_servicio"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-300"
                      [class.border-red-500]="servicio.get('nombre_servicio')?.invalid && servicio.get('nombre_servicio')?.touched">
                    <div *ngIf="servicio.get('nombre_servicio')?.invalid && servicio.get('nombre_servicio')?.touched"
                      class="text-red-500 text-sm mt-1">
                      Requerido
                    </div>
                  </div>

                  <!-- Fecha de reunión -->
                  <div>
                    <label class="block text-gray-700 font-medium mb-2">Fecha de Reunión</label>
                    <input formControlName="fecha_reunion" type="date"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-300"
                      [class.border-red-500]="servicio.get('fecha_reunion')?.invalid && servicio.get('fecha_reunion')?.touched">
                    <div *ngIf="servicio.get('fecha_reunion')?.invalid && servicio.get('fecha_reunion')?.touched"
                      class="text-red-500 text-sm mt-1">
                      Fecha futura requerida
                    </div>
                  </div>

                  <!-- Comentarios -->
                  <div>
                    <label class="block text-gray-700 font-medium mb-2">Comentarios</label>
                    <textarea formControlName="comentarios" rows="2"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-300">
                    </textarea>
                  </div>

                  <!-- Costo estimado -->
                  <div>
                    <label class="block text-gray-700 font-medium mb-2">Costo Estimado</label>
                    <input formControlName="costo_estimado" type="number"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-300">
                  </div>
                </div>

                <!-- Botón eliminar -->
                <button *ngIf="servicios.length > 1" type="button" (click)="eliminarServicio(i)"
                  class="absolute top-2 right-2 text-red-500 hover:text-red-700">
                  <fa-icon [icon]="faTrash"></fa-icon>
                </button>
              </div>
            </div>

            <!-- Botones de servicios -->
            <div class="flex justify-between mb-6">
              <button type="button" (click)="agregarServicio()"
                class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <i class="fas fa-plus"></i> Agregar Servicio
              </button>

              <div
                *ngIf="solicitudForm.get('servicios')?.errors?.['minlength'] && solicitudForm.get('servicios')?.touched"
                class="text-red-500 self-center">
                Se requiere al menos un servicio
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="flex justify-end gap-3">
              <button type="button" (click)="onCerrar()"
                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                Cancelar
              </button>
              <button type="submit" [disabled]="solicitudForm.invalid || cargando"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50">
                <i class="fas fa-save"></i>
                {{ cargando ? 'Guardando...' : 'Crear Solicitud' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ModalCreacionComponent implements OnInit, OnChanges {
  @Input() mostrar = false;
  @Input() cargando = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() crear = new EventEmitter<any>();

  faTimes = faTimes;
  faTrash = faTrash;
  solicitudForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initSolicitudForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mostrar'] && changes['mostrar'].currentValue) {
      this.initSolicitudForm();
    }
  }

  initSolicitudForm(): void {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const tomorrow = today.toISOString().split('T')[0];

    this.solicitudForm = this.fb.group({
      cliente: ['', Validators.required],
      email_cliente: ['', [Validators.required, Validators.email]],
      observaciones: ['', Validators.maxLength(500)],
      servicios: this.fb.array([
        this.fb.group({
          nombre_servicio: ['', Validators.required],
          fecha_reunion: [tomorrow, [Validators.required, this.futuraFechaValidator]],
          comentarios: [''],
          costo_estimado: [null]
        })
      ], Validators.minLength(1))
    });
  }

  get servicios(): FormArray {
    return this.solicitudForm.get('servicios') as FormArray;
  }

  agregarServicio(): void {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const tomorrow = today.toISOString().split('T')[0];

    this.servicios.push(this.fb.group({
      nombre_servicio: ['', Validators.required],
      fecha_reunion: [tomorrow, [Validators.required, this.futuraFechaValidator]],
      comentarios: [''],
      costo_estimado: [null]
    }));
  }

  eliminarServicio(index: number): void {
    if (this.servicios.length > 1) {
      this.servicios.removeAt(index);
    } else {
      alert('Una solicitud debe tener al menos un servicio.');
    }
  }

  futuraFechaValidator(control: AbstractControl): {[key: string]: any} | null {
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedDate > today ? null : { 'fechaPasada': { value: control.value } };
  }

  onSubmit(): void {
    if (this.solicitudForm.invalid) {
      this.solicitudForm.markAllAsTouched();
      return;
    }

    this.crear.emit(this.solicitudForm.value);
  }

  onCerrar(): void {
    this.cerrar.emit();
  }
}
