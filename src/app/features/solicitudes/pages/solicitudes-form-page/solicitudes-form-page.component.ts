import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SolicitudService } from '../../../../core/services/solicitud.service';
import { Solicitud } from '../../../../core/models/solicitud.model';
import { Servicio } from '../../../../core/models/servicio.model'; // Corrected: Import 'Servicio' model
import { CommonModule } from '@angular/common'; // Necessary for *ngIf, *ngFor
import { ReactiveFormsModule } from '@angular/forms'; // Necessary for reactive forms
import { Observable } from 'rxjs';

@Component({
  selector: 'app-solicitud-form-page',
  templateUrl: './solicitudes-form-page.component.html',
  standalone: true, // Mark as standalone if not in a module
  imports: [CommonModule, ReactiveFormsModule], // Import necessary modules
})
export class SolicitudFormPageComponent implements OnInit {
  solicitudForm!: FormGroup; // Renamed from 'form' to 'solicitudForm' for clarity
  cargando = false;
  editando = false;
  solicitudId!: number;
  estadosSolicitud = ['Abierta', 'En Proceso', 'Cerrada', 'Cancelada']; // Request States
  estadosServicio = ['Pendiente', 'Aprobado', 'Rechazado', 'Vencido']; // Service States

  mensajeError: string | null = null; // To display error messages in the UI
  mensajeExito: string | null = null; // To display success messages in the UI

  constructor(
    private fb: FormBuilder,
    private solicitudService: SolicitudService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.crearFormulario();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editando = true;
      this.solicitudId = +id;
      this.cargarSolicitud();
    } else {
      // If it's a new request, add a default service (mandatory)
      this.agregarServicio();
    }
  }

  // Getter to easily access form controls
  get f() {
    return this.solicitudForm.controls;
  }

  // Getter for the services FormArray
  get servicios(): FormArray {
    return this.solicitudForm.get('servicios') as FormArray;
  }

  crearFormulario(): void {
    this.solicitudForm = this.fb.group({
      cliente: ['', [Validators.required, Validators.maxLength(100)]],
      email_cliente: ['', [Validators.required, Validators.email]],
      observaciones: ['', Validators.maxLength(500)], // Corrected to 'observaciones'
      estado: ['Abierta', Validators.required], // Main request status
      servicios: this.fb.array([], Validators.minLength(1)), // FormArray for services
    });
  }

  // Method to create a FormGroup for a new service
  private crearServicioFormGroup(servicio?: Servicio): FormGroup {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const tomorrow = today.toISOString().split('T')[0];

    // Validar fecha de servicio
    let fechaValida = servicio?.fecha_reunion || tomorrow;
    if (servicio?.fecha_reunion) {
      const fechaISO = new Date(servicio.fecha_reunion);
      if (!isNaN(fechaISO.getTime())) {
        fechaValida = fechaISO.toISOString().split('T')[0];
      }
    }

    return this.fb.group({
      id_servicio: [servicio?.id_servicio || null],
      nombre_servicio: [servicio?.nombre_servicio || '', Validators.required],
      fecha_reunion: [
        fechaValida,
        [Validators.required, this.futuraFechaValidator],
      ],
      estado_servicio: [
        servicio?.estado_servicio || 'Pendiente',
        Validators.required,
      ],
      comentarios: [servicio?.comentarios || '']
    });
  }

  agregarServicio(servicio?: Servicio): void {
    this.servicios.push(this.crearServicioFormGroup(servicio));
  }

  eliminarServicio(index: number): void {
    const servicioControl = this.servicios.at(index);
    const servicioId = servicioControl.get('id_servicio')?.value;

    if (this.editando && servicioId) {
      // If we are editing and the service already exists in the DB, confirm deletion
      this.mostrarMensajeConfirmacion(
        '¿Estás seguro de que deseas eliminar este servicio?',
        () => {
          this.cargando = true;
          this.solicitudService.deleteService(servicioId).subscribe({
            next: () => {
              this.servicios.removeAt(index);
              this.mostrarMensajeExito('Servicio eliminado con éxito.');
              this.cargando = false;
              this.actualizarEstadoFormularioPrincipal(); // Recalculate if the request can be edited
            },
            error: (err: any) => {
              console.error('Error al eliminar servicio:', err);
              this.mostrarMensajeError('Error al eliminar el servicio.');
              this.cargando = false;
            },
          });
        }
      );
    } else {
      // If it's a new service (not yet saved) or we are not editing, simply remove it from the FormArray
      if (this.servicios.length > 1) {
        // Do not allow deletion if it's the only service and it's mandatory
        this.servicios.removeAt(index);
      } else {
        this.mostrarMensajeError(
          'Una solicitud debe tener al menos un servicio.'
        );
      }
    }
  }

  futuraFechaValidator(
    control: AbstractControl
  ): { [key: string]: any } | null {
    if (!control.value) return null; // Do not validate if empty, Validators.required will handle it

    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day for comparison

    return selectedDate > today
      ? null
      : { fechaPasada: { value: control.value } };
  }

  cargarSolicitud(): void {
    this.cargando = true;
    this.solicitudService.getSolicitudById(this.solicitudId).subscribe({
      next: (solicitud: Solicitud) => {
        this.solicitudForm.patchValue({
          cliente: solicitud.cliente,
          email_cliente: solicitud.email_cliente,
          observaciones: solicitud.observaciones,
          estado: solicitud.estado,
        });

        // Formatear fechas de servicios antes de agregarlos
        if (solicitud.servicios) {
          solicitud.servicios.forEach((servicio) => {
            // Convertir fecha al formato YYYY-MM-DD si es necesario
            const fechaISO = new Date(servicio.fecha_reunion);
            if (!isNaN(fechaISO.getTime())) {
              servicio.fecha_reunion = fechaISO.toISOString().split('T')[0];
            }
            this.agregarServicio(servicio);
          });
        }

        this.actualizarEstadoFormularioPrincipal();
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar la solicitud:', err);
        this.cargando = false;
        this.mostrarMensajeError(
          'Error al cargar la solicitud. Redirigiendo...'
        );
        setTimeout(() => this.router.navigate(['/solicitudes']), 2000);
      },
    });
  }

  // Business rule: A request can only be modified if it has at least one service in "Pendiente" status
  actualizarEstadoFormularioPrincipal(): void {
    const tieneServiciosPendientes = this.servicios.controls.some(
      (control: AbstractControl) =>
        control.get('estado_servicio')?.value === 'Pendiente'
    );

    if (this.editando && !tieneServiciosPendientes) {
      this.solicitudForm.get('cliente')?.disable();
      this.solicitudForm.get('email_cliente')?.disable();
      this.solicitudForm.get('observaciones')?.disable();
      this.solicitudForm.get('estado')?.disable(); // Also the main request status
      this.mostrarMensajeError(
        'Esta solicitud no puede ser modificada porque no tiene servicios en estado "Pendiente".'
      );
    } else {
      this.solicitudForm.get('cliente')?.enable();
      this.solicitudForm.get('email_cliente')?.enable();
      this.solicitudForm.get('observaciones')?.enable();
      this.solicitudForm.get('estado')?.enable();
      this.mensajeError = null; // Clear message if enabled
    }
  }

  guardar(): void {
    this.mensajeError = null;
    this.mensajeExito = null;

    if (this.solicitudForm.invalid) {
      this.solicitudForm.markAllAsTouched();
      this.mostrarMensajeError(
        'Por favor, corrige los errores del formulario.'
      );
      return;
    }

    this.cargando = true;

    if (this.editando) {
      // Update the main request
      const solicitudUpdatePayload = {
        cliente: this.solicitudForm.value.cliente,
        email_cliente: this.solicitudForm.value.email_cliente,
        observaciones: this.solicitudForm.value.observaciones,
        estado: this.solicitudForm.value.estado, // Allows updating the main status
      };

      this.solicitudService
        .updateSolicitud(this.solicitudId, solicitudUpdatePayload)
        .subscribe({
          next: () => {
            // After updating the main request, update/create/delete services
            this.manejarActualizacionServicios();
          },
          error: (err: any) => {
            console.error('Error al actualizar la solicitud principal:', err);
            this.mostrarMensajeError(
              'Error al actualizar la solicitud principal.'
            );
            this.cargando = false;
          },
        });
    } else {
      // Create new request with nested services
      const nuevaSolicitud: Solicitud = {
        id: 0, // ID is auto-incremented in the backend
        cliente: this.solicitudForm.value.cliente,
        email_cliente: this.solicitudForm.value.email_cliente,
        fecha_solicitud: '', // Generated in the backend
        estado: 'Abierta', // Initial status
        observaciones: this.solicitudForm.value.observaciones,
        fecha_ultima_modificacion: '', // Generated in the backend
        servicios: this.solicitudForm.value.servicios.map((s: any) => ({
          nombre_servicio: s.nombre_servicio,
          fecha_reunion: s.fecha_reunion,
          comentarios: s.comentarios
        })),
      };

      this.solicitudService.createSolicitud(nuevaSolicitud).subscribe({
        next: () => {
          this.mostrarMensajeExito('Solicitud creada con éxito.');
          this.cargando = false;
          setTimeout(() => this.router.navigate(['/solicitudes']), 1500);
        },
        error: (err: any) => {
          console.error('Error al crear la solicitud:', err);
          this.mostrarMensajeError('Error al crear la solicitud.');
          this.cargando = false;
        },
      });
    }
  }

  private manejarActualizacionServicios(): void {
    const serviciosActualizados: Servicio[] =
      this.solicitudForm.value.servicios;
    const observables: Observable<any>[] = [];

    serviciosActualizados.forEach((servicio) => {
      if (servicio.id_servicio) {
        // If the service already has an ID, it's an update
        observables.push(
          this.solicitudService.updateService(servicio.id_servicio, servicio)
        );
      } else {
        // If it doesn't have an ID, it's a new service that must be added to the existing request
        if (this.solicitudId) {
          observables.push(
            this.solicitudService.addServiceToSolicitud(
              this.solicitudId,
              servicio
            )
          );
        }
      }
    });

    // Execute all service operations in parallel
    if (observables.length > 0) {
      // Use forkJoin to wait for all service operations to complete
      // or simply subscribe to each one if order doesn't matter and one error shouldn't stop others.
      // For simplicity, here we subscribe to each one.
      let completedOperations = 0;
      let hasError = false;

      observables.forEach((obs) => {
        obs.subscribe({
          next: () => {
            completedOperations++;
            if (completedOperations === observables.length && !hasError) {
              this.mostrarMensajeExito(
                'Solicitud y servicios actualizados con éxito.'
              );
              this.cargando = false;
              setTimeout(() => this.router.navigate(['/solicitudes']), 1500);
            }
          },
          error: (err: any) => {
            console.error('Error in service operation:', err);
            hasError = true;
            this.mostrarMensajeError(
              'Error al actualizar uno o más servicios.'
            );
            this.cargando = false;
          },
        });
      });
    } else {
      this.mostrarMensajeExito(
        'Solicitud actualizada con éxito (sin cambios en servicios).'
      );
      this.cargando = false;
      setTimeout(() => this.router.navigate(['/solicitudes']), 1500);
    }
  }

  cancelar(): void {
    this.router.navigate(['/solicitudes']);
  }

  // --- Methods to display messages in the UI ---
  private mostrarMensajeError(mensaje: string): void {
    this.mensajeExito = null;
    this.mensajeError = mensaje;
  }

  private mostrarMensajeExito(mensaje: string): void {
    this.mensajeError = null;
    this.mensajeExito = mensaje;
  }

  private mostrarMensajeConfirmacion(
    mensaje: string,
    onConfirm: () => void
  ): void {
    // Implement a modal or confirmation component here
    // For now, we will use a simple confirm() (although it was recommended to avoid it, for a quick MVP)
    // In a real application, you would use a modal service.
    if (confirm(mensaje)) {
      onConfirm();
    }
  }
}
