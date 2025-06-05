import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Solicitud } from '../../../../core/models/solicitud.model';
import { Servicio } from '../../../../core/models/servicio.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faTrash, faSave, faTimesCircle} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-solicitud-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule
  ],
  template: `
    <form [formGroup]="solicitudForm" (ngSubmit)="onSubmit()">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label for="cliente" class="block text-sm font-medium text-gray-700">Cliente</label>
          <input
            type="text"
            id="cliente"
            formControlName="cliente"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            [class.border-red-500]="solicitudForm.get('cliente')?.invalid && solicitudForm.get('cliente')?.touched"
          />
          <div *ngIf="solicitudForm.get('cliente')?.invalid && solicitudForm.get('cliente')?.touched" class="text-red-500 text-sm mt-1">
            El cliente es requerido.
          </div>
        </div>
        <div>
          <label for="emailCliente" class="block text-sm font-medium text-gray-700">Email Cliente</label>
          <input
            type="email"
            id="emailCliente"
            formControlName="emailCliente"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            [class.border-red-500]="solicitudForm.get('emailCliente')?.invalid && solicitudForm.get('emailCliente')?.touched"
          />
          <div *ngIf="solicitudForm.get('emailCliente')?.invalid && solicitudForm.get('emailCliente')?.touched" class="text-red-500 text-sm mt-1">
            Debe ser un email válido.
          </div>
        </div>
      </div>

      <div class="mb-6">
        <label for="observaciones" class="block text-sm font-medium text-gray-700">Observaciones</label>
        <textarea
          id="observaciones"
          formControlName="observaciones"
          rows="3"
          maxlength="500"
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          [class.border-red-500]="solicitudForm.get('observaciones')?.invalid && solicitudForm.get('observaciones')?.touched"
        ></textarea>
        <div *ngIf="solicitudForm.get('observaciones')?.errors?.['maxlength']" class="text-red-500 text-sm mt-1">
          Máximo 500 caracteres.
        </div>
      </div>

      <h3 class="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Servicios Solicitados</h3>
      <div formArrayName="servicios" class="mb-6 border p-4 rounded-md bg-gray-50">
        <div *ngFor="let servicioGroup of servicios.controls; let i = index" [formGroupName]="i" class="mb-4 p-4 border rounded-md bg-white shadow-sm relative">
          <h4 class="text-lg font-medium text-gray-700 mb-2">Servicio #{{ i + 1 }}</h4>
          <button
            type="button"
            (click)="removeServicio(i)"
            class="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full"
            title="Eliminar Servicio"
          >
            <fa-icon [icon]="faTrash" size="lg"></fa-icon>
          </button>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label [for]="'nombreServicio' + i" class="block text-sm font-medium text-gray-700">Nombre Servicio</label>
              <input
                type="text"
                [id]="'nombreServicio' + i"
                formControlName="nombreServicio"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-500]="servicioGroup.get('nombreServicio')?.invalid && servicioGroup.get('nombreServicio')?.touched"
              />
              <div *ngIf="servicioGroup.get('nombreServicio')?.invalid && servicioGroup.get('nombreServicio')?.touched" class="text-red-500 text-sm mt-1">
                El nombre del servicio es requerido.
              </div>
            </div>
            <div>
              <label [for]="'fechaReunion' + i" class="block text-sm font-medium text-gray-700">Fecha Reunión</label>
              <input
                type="datetime-local"
                [id]="'fechaReunion' + i"
                formControlName="fechaReunion"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-500]="servicioGroup.get('fechaReunion')?.invalid && servicioGroup.get('fechaReunion')?.touched"
              />
              <div *ngIf="servicioGroup.get('fechaReunion')?.invalid && servicioGroup.get('fechaReunion')?.touched" class="text-red-500 text-sm mt-1">
                <span *ngIf="servicioGroup.get('fechaReunion')?.errors?.['required']">La fecha de reunión es requerida.</span>
                <span *ngIf="servicioGroup.get('fechaReunion')?.errors?.['futureDate']">La fecha debe ser futura.</span>
              </div>
            </div>
          </div>

          <div *ngIf="isEditMode && servicioGroup.get('idServicio')?.value" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label [for]="'estadoServicio' + i" class="block text-sm font-medium text-gray-700">Estado Servicio</label>
              <select
                [id]="'estadoServicio' + i"
                formControlName="estadoServicio"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Rechazado">Rechazado</option>
                <option value="Vencido" [disabled]="true">Vencido (Automático)</option>
              </select>
            </div>
            <div>
              <label [for]="'costoEstimado' + i" class="block text-sm font-medium text-gray-700">Costo Estimado</label>
              <input
                type="number"
                [id]="'costoEstimado' + i"
                formControlName="costoEstimado"
                [readonly]="servicioGroup.get('estadoServicio')?.value !== 'Aprobado'"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                [class.bg-gray-100]="servicioGroup.get('estadoServicio')?.value !== 'Aprobado'"
              />
            </div>
            <div class="md:col-span-2">
              <label [for]="'comentarios' + i" class="block text-sm font-medium text-gray-700">Comentarios</label>
              <textarea
                [id]="'comentarios' + i"
                formControlName="comentarios"
                rows="2"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
          </div>
        </div>
        <button
          type="button"
          (click)="addServicio()"
          class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md flex items-center mt-4"
        >
          <fa-icon [icon]="faPlus" class="mr-2"></fa-icon>
          Agregar Servicio
        </button>
      </div>

      <div class="flex justify-end space-x-4">
        <button
          type="button"
          (click)="cancel.emit()"
          class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md flex items-center"
        >
          <fa-icon [icon]="faTimesCircle" class="mr-2"></fa-icon>
          Cancelar
        </button>
        <button
          type="submit"
          [disabled]="solicitudForm.invalid"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center disabled:opacity-50"
        >
          <fa-icon [icon]="faSave" class="mr-2"></fa-icon>
          {{ isEditMode ? 'Guardar Cambios' : 'Crear Solicitud' }}
        </button>
      </div>
    </form>
  `,
  styles: []
})
export class SolicitudFormComponent implements OnInit {
  @Input() solicitudData: Solicitud | null = null;
  @Input() isEditMode: boolean = false;
  @Output() formSubmit = new EventEmitter<Solicitud>();
  @Output() serviceDelete = new EventEmitter<{ index: number, id: number | undefined }>();
  @Output() cancel = new EventEmitter<void>();

  solicitudForm!: FormGroup;

  faPlus = faPlus;
  faTrash = faTrash;
  faSave = faSave;
  faTimesCircle = faTimesCircle;
  // faSave and faTimesCircle will be passed from the parent page if needed or handled there.

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
    if (this.solicitudData) {
      this.populateForm(this.solicitudData);
    }
  }

  initForm(): void {
    this.solicitudForm = this.fb.group({
      cliente: ['', Validators.required],
      emailCliente: ['', [Validators.required, Validators.email]],
      observaciones: ['', Validators.maxLength(500)],
      servicios: this.fb.array([]) // Initialize as empty FormArray
    });
  }

  populateForm(solicitud: Solicitud): void {
    this.solicitudForm.patchValue({
      cliente: solicitud.cliente,
      emailCliente: solicitud.email_cliente,
      observaciones: solicitud.observaciones
    });

    this.servicios.clear();
    solicitud.servicios?.forEach(servicio => {
      this.addServicio(servicio);
    });
  }

  get servicios(): FormArray {
    return this.solicitudForm.get('servicios') as FormArray;
  }

  addServicio(servicio?: Servicio): void {
    const serviceGroup = this.fb.group({
      idServicio: [servicio?.idServicio || null], // Keep ID for existing services
      nombreServicio: [servicio?.nombreServicio || '', Validators.required],
      fechaReunion: [servicio?.fechaReunion ? this.formatDateForInput(servicio.fechaReunion) : '', [Validators.required, this.futureDateValidator]],
      estadoServicio: [servicio?.estadoServicio || 'Pendiente'],
      comentarios: [servicio?.comentarios || ''],
      // Only enable costoEstimado if in 'Aprobado' state AND isEditMode
      costoEstimado: [{ value: servicio?.costoEstimado || null, disabled: !(this.isEditMode && servicio?.estadoServicio === 'Aprobado') }]
    });

    // Subscribe to state changes to enable/disable costoEstimado
    serviceGroup.get('estadoServicio')?.valueChanges.subscribe(estado => {
      const costoEstimadoControl = serviceGroup.get('costoEstimado');
      if (costoEstimadoControl) {
        if (this.isEditMode && estado === 'Aprobado') {
          costoEstimadoControl.enable();
        } else {
          costoEstimadoControl.disable();
          costoEstimadoControl.setValue(null); // Clear value if not approved
        }
      }
    });

    this.servicios.push(serviceGroup);
  }

  removeServicio(index: number): void {
    const serviceControl = this.servicios.at(index);
    const serviceId = serviceControl.get('idServicio')?.value;
    this.serviceDelete.emit({ index, id: serviceId }); // Emit to parent for handling deletion (backend or just form)
  }

  futureDateValidator(control: any): { [key: string]: any } | null {
    const date = new Date(control.value);
    const now = new Date();
    // Allow a small buffer for input time to avoid immediate "past" issues
    if (date < now) {
      return { 'futureDate': true };
    }
    return null;
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onSubmit(): void {
    if (this.solicitudForm.invalid) {
      this.solicitudForm.markAllAsTouched();
      // Parent component (page) will handle SweetAlert message
      return;
    }
    // Use getRawValue() to include disabled fields, e.g., costoEstimado if it was disabled
    this.formSubmit.emit(this.solicitudForm.getRawValue() as Solicitud);
  }
}
