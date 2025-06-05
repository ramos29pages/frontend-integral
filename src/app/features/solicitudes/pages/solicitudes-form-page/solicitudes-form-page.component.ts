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
import { Servicio } from '../../../../core/models/servicio.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-solicitud-form-page',
  templateUrl: './solicitudes-form-page.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class SolicitudFormPageComponent implements OnInit {
  solicitudForm!: FormGroup;
  cargando = false;
  editando = false; // SOLO MODO EDICIÓN
  solicitudId!: number;
  estadosSolicitud = ['Abierta', 'En Proceso', 'Cerrada', 'Cancelada'];
  estadosServicio = ['Pendiente', 'Aprobado', 'Rechazado', 'Vencido'];

  mensajeError: string | null = null;
  mensajeExito: string | null = null;

  // Control de actualización basado en lógica de negocio
  canUpdateSolicitud: boolean = false;

  // Nuevo: Control para mostrar/ocultar botones de agregar/eliminar servicios
  canModifyServices: boolean = false;

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
      // SOLO MODO EDICIÓN
      this.editando = true;
      this.solicitudId = +id;
      this.cargarSolicitud();
    } else {
      // REDIRIGIR si no hay ID - solo permitimos edición
      this.mostrarMensajeError('Esta página solo permite editar solicitudes existentes.');
      setTimeout(() => this.router.navigate(['/solicitudes']), 2000);
    }
  }

  get f() {
    return this.solicitudForm.controls;
  }

  get servicios(): FormArray {
    return this.solicitudForm.get('servicios') as FormArray;
  }

  crearFormulario(): void {
    this.solicitudForm = this.fb.group({
      cliente: ['', [Validators.required, Validators.maxLength(100)]],
      email_cliente: ['', [Validators.required, Validators.email]],
      observaciones: ['', Validators.maxLength(500)],
      estado: ['Abierta', Validators.required],
      servicios: this.fb.array([], Validators.minLength(1)),
    });
  }

  private crearServicioFormGroup(servicio?: Servicio): FormGroup {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const tomorrow = today.toISOString().split('T')[0];

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
      comentarios: [servicio?.comentarios || ''],
      // AGREGAR el campo costo_estimado que falta
      costo_estimado: [servicio?.costo_estimado || 0, [Validators.min(0)]]
    });
  }

  agregarServicio(servicio?: Servicio): void {
    // Solo permitir agregar servicios si se puede modificar
    if (!this.canModifyServices) {
      this.mostrarMensajeError('No se pueden agregar servicios. La solicitud no tiene servicios pendientes.');
      return;
    }

    const newServiceControl = this.crearServicioFormGroup(servicio);
    this.servicios.push(newServiceControl);

    // Solo actualizar estado si no estamos cargando
    if (!this.cargando) {
      this.actualizarEstadoFormulario();
    }
  }

  eliminarServicio(index: number): void {
    // Solo permitir eliminar servicios si se puede modificar
    if (!this.canModifyServices) {
      this.mostrarMensajeError('No se pueden eliminar servicios. La solicitud no tiene servicios pendientes.');
      return;
    }

    const servicioControl = this.servicios.at(index);
    const servicioId = servicioControl.get('id_servicio')?.value;

    if (servicioId) {
      this.mostrarMensajeConfirmacion(
        '¿Estás seguro de que deseas eliminar este servicio?',
        () => {
          this.cargando = true;
          this.solicitudService
            .deleteService(servicioId)
            .pipe(
              finalize(() => {
                this.cargando = false;
                this.actualizarEstadoFormulario();
              })
            )
            .subscribe({
              next: () => {
                this.servicios.removeAt(index);
                this.mostrarMensajeExito('Servicio eliminado con éxito.');
              },
              error: (err: any) => {
                console.error('Error al eliminar servicio:', err);
                this.mostrarMensajeError('Error al eliminar el servicio.');
              },
            });
        }
      );
    } else {
      if (this.servicios.length > 1) {
        this.servicios.removeAt(index);
        this.actualizarEstadoFormulario();
      } else {
        this.mostrarMensajeError('Una solicitud debe tener al menos un servicio.');
      }
    }
  }

  futuraFechaValidator(control: AbstractControl): { [key: string]: any } | null {
    if (!control.value) return null;

    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedDate > today
      ? null
      : { fechaPasada: { value: control.value } };
  }

  cargarSolicitud(): void {
    this.cargando = true;
    this.solicitudService
      .getSolicitudById(this.solicitudId)
      .pipe(
        finalize(() => (this.cargando = false))
      )
      .subscribe({
        next: (solicitud: Solicitud) => {
          console.log('Solicitud cargada:', solicitud);

          // Limpiar servicios antes de cargar
          this.servicios.clear();

          // Cargar datos principales
          this.solicitudForm.patchValue({
            cliente: solicitud.cliente,
            email_cliente: solicitud.email_cliente,
            observaciones: solicitud.observaciones,
            estado: solicitud.estado,
          });

          // Cargar servicios
          if (solicitud.servicios && solicitud.servicios.length > 0) {
            console.log('Servicios a cargar:', solicitud.servicios);

            solicitud.servicios.forEach((servicio, index) => {
              console.log(`Cargando servicio ${index}:`, servicio);

              // Convertir fecha
              let fechaValida = servicio.fecha_reunion;
              if (servicio.fecha_reunion) {
                try {
                  const fechaISO = new Date(servicio.fecha_reunion);
                  if (!isNaN(fechaISO.getTime())) {
                    fechaValida = fechaISO.toISOString().split('T')[0];
                  }
                } catch (error) {
                  console.error('Error procesando fecha:', error);
                }
              }

              // Crear FormGroup directamente
              const servicioFormGroup = this.crearServicioFormGroup({
                ...servicio,
                fecha_reunion: fechaValida
              });

              this.servicios.push(servicioFormGroup);
            });

            console.log('FormArray servicios después de cargar:', this.servicios.controls);
          } else {
            console.log('No hay servicios para cargar');
          }

          // IMPORTANTE: Aplicar lógica de negocio después de cargar todo
          this.actualizarEstadoFormulario();
        },
        error: (err: any) => {
          console.error('Error al cargar la solicitud:', err);
          this.mostrarMensajeError('Error al cargar la solicitud. Redirigiendo...');
          setTimeout(() => this.router.navigate(['/solicitudes']), 2000);
        },
      });
  }

  actualizarEstadoFormulario(): void {
    console.log('=== Actualizando estado del formulario ===');
    console.log('Número de servicios:', this.servicios.length);

    const tieneServiciosPendientes = this.servicios.controls.some(
      (control: AbstractControl) => {
        const estado = control.get('estado_servicio')?.value;
        console.log('Estado del servicio:', estado);
        return estado === 'Pendiente';
      }
    );

    console.log('¿Tiene servicios pendientes?:', tieneServiciosPendientes);

    if (!tieneServiciosPendientes) {
      // SIN SERVICIOS PENDIENTES - DESHABILITAR TODO
      console.log('🔒 DESHABILITANDO - No hay servicios pendientes');

      // Deshabilitar campos principales
      this.solicitudForm.get('cliente')?.disable({ emitEvent: false });
      this.solicitudForm.get('email_cliente')?.disable({ emitEvent: false });
      this.solicitudForm.get('observaciones')?.disable({ emitEvent: false });
      this.solicitudForm.get('estado')?.disable({ emitEvent: false });

      // Deshabilitar todos los servicios
      this.servicios.controls.forEach((serviceControl) => {
        serviceControl.disable({ emitEvent: false });
      });

      // Controles de estado
      this.canUpdateSolicitud = false;
      this.canModifyServices = false;

      this.mostrarMensajeError(
        'Esta solicitud no puede ser modificada porque no tiene servicios en estado "Pendiente".'
      );
    } else {
      // CON SERVICIOS PENDIENTES - HABILITAR TODO
      console.log('🔓 HABILITANDO - Hay servicios pendientes');

      // Habilitar campos principales
      this.solicitudForm.get('cliente')?.enable({ emitEvent: false });
      this.solicitudForm.get('email_cliente')?.enable({ emitEvent: false });
      this.solicitudForm.get('observaciones')?.enable({ emitEvent: false });
      this.solicitudForm.get('estado')?.enable({ emitEvent: false });

      // Habilitar todos los servicios
      this.servicios.controls.forEach((serviceControl) => {
        serviceControl.enable({ emitEvent: false });
      });

      // Controles de estado
      this.canUpdateSolicitud = true;
      this.canModifyServices = true;

      this.mensajeError = null; // Limpiar mensaje de error
    }

    console.log('canUpdateSolicitud:', this.canUpdateSolicitud);
    console.log('canModifyServices:', this.canModifyServices);
    console.log('=== Fin actualización estado ===');
  }

  guardar(): void {
    this.mensajeError = null;
    this.mensajeExito = null;

    // Verificar lógica de negocio ANTES de validar formulario
    if (!this.canUpdateSolicitud) {
      this.mostrarMensajeError(
        'No se puede actualizar la solicitud porque no tiene servicios en estado "Pendiente".'
      );
      return;
    }

    // Validar formulario
    if (this.solicitudForm.invalid) {
      this.solicitudForm.markAllAsTouched();
      this.mostrarMensajeError('Por favor, corrige los errores del formulario.');
      return;
    }

    this.cargando = true;

    // SOLO ACTUALIZACIÓN (no creación)
    const solicitudUpdatePayload = this.solicitudForm.getRawValue();

    this.solicitudService
      .updateSolicitud(this.solicitudId, solicitudUpdatePayload)
      .pipe(
        finalize(() => (this.cargando = false))
      )
      .subscribe({
        next: () => {
          this.manejarActualizacionServicios();
        },
        error: (err: any) => {
          console.error('Error al actualizar la solicitud principal:', err);
          this.mostrarMensajeError('Error al actualizar la solicitud principal.');
        },
      });
  }

  private manejarActualizacionServicios(): void {
    const serviciosActualizados: Servicio[] = this.solicitudForm.getRawValue().servicios;
    const observables: Observable<any>[] = [];

    serviciosActualizados.forEach((servicio) => {
      if (servicio.id_servicio) {
        observables.push(
          this.solicitudService.updateService(servicio.id_servicio, servicio)
        );
      } else {
        if (this.solicitudId) {
          observables.push(
            this.solicitudService.addServiceToSolicitud(this.solicitudId, servicio)
          );
        }
      }
    });

    if (observables.length > 0) {
      let completedOperations = 0;
      let hasError = false;

      observables.forEach((obs) => {
        obs
          .pipe(
            finalize(() => {
              completedOperations++;
              if (completedOperations === observables.length) {
                this.cargando = false;
                if (!hasError) {
                  this.mostrarMensajeExito('Solicitud y servicios actualizados con éxito.');
                  setTimeout(() => this.router.navigate(['/solicitudes']), 1500);
                }
              }
            })
          )
          .subscribe({
            next: () => {},
            error: (err: any) => {
              console.error('Error in service operation:', err);
              hasError = true;
              this.mostrarMensajeError('Error al actualizar uno o más servicios.');
            },
          });
      });
    } else {
      this.mostrarMensajeExito('Solicitud actualizada con éxito (sin cambios en servicios).');
      this.cargando = false;
      setTimeout(() => this.router.navigate(['/solicitudes']), 1500);
    }
  }

  cancelar(): void {
    this.router.navigate(['/solicitudes']);
  }

  private mostrarMensajeError(mensaje: string): void {
    this.mensajeExito = null;
    this.mensajeError = mensaje;
  }

  private mostrarMensajeExito(mensaje: string): void {
    this.mensajeError = null;
    this.mensajeExito = mensaje;
  }

  private mostrarMensajeConfirmacion(mensaje: string, onConfirm: () => void): void {
    if (confirm(mensaje)) {
      onConfirm();
    }
  }
}
