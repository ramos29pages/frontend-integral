import { Component, OnInit } from '@angular/core';
import { SolicitudService } from '../../../../core/services/solicitud.service';
import { Solicitud, PagedResponse } from '../../../../core/models/solicitud.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { faEye, faEdit, faTrash, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms'; // Import reactive form modules
import Swal from 'sweetalert2';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-solicitudes-page',
  templateUrl: './solicitudes-page.component.html',
  standalone: true, // If it's a standalone component
  imports: [CommonModule, ReactiveFormsModule, FormsModule, FontAwesomeModule] // Ensure ReactiveFormsModule is imported
})
export class SolicitudesPageComponent implements OnInit {


  faEye = faEye;
  faEdit = faEdit;
  faTrash = faTrash;
  faPlus = faPlus;
  faTimes = faTimes;
  solicitudes: Solicitud[] = [];
  estados = ['Abierta', 'En Proceso', 'Cerrada', 'Cancelada'];
  filtros = {
    estado: '',
    cliente: '',
  };
  paginaActual = 1;
  totalPaginas = 0;
  totalRegistros = 0;
  cargando = false;

  // --- New properties for the creation form ---
  mostrarFormularioCreacion = false;
  solicitudForm!: FormGroup;
  cargandoCreacion = false;
  errorComunicacionCreacion = false;
  // --- End new properties ---

  constructor(
    private solicitudService: SolicitudService,
    private router: Router,
    private fb: FormBuilder // Inject FormBuilder
  ) {}

  ngOnInit(): void {
    this.cargarSolicitudes();
    this.initSolicitudForm(); // Initialize the form when the component loads
  }

  // --- New method to initialize the form ---
  initSolicitudForm(): void {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Default for future meeting date
    const tomorrow = today.toISOString().split('T')[0];

    this.solicitudForm = this.fb.group({
      cliente: ['', Validators.required],
      email_cliente: ['', [Validators.required, Validators.email]],
      observaciones: ['', Validators.maxLength(500)],
      servicios: this.fb.array([
        // Initialize with one default service, as it's mandatory
        this.fb.group({
          nombre_servicio: ['', Validators.required],
          fecha_reunion: [tomorrow, [Validators.required, this.futuraFechaValidator]],
          comentarios: [''],
          costo_estimado: [null]
        })
      ], Validators.minLength(1))
    });
  }

  // --- Getters for form array ---
  get servicios(): FormArray {
    return this.solicitudForm.get('servicios') as FormArray;
  }

  // --- Methods for managing services in the form ---
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
    if (this.servicios.length > 1) { // Prevent deleting all services if minLength(1) is set
      this.servicios.removeAt(index);
    } else {
      alert('Una solicitud debe tener al menos un servicio.');
    }
  }

  // --- Custom validator for future date ---
  futuraFechaValidator(control: AbstractControl): {[key: string]: any} | null {
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedDate > today ? null : { 'fechaPasada': { value: control.value } };
  }

  // --- New method for submitting the creation form ---
  // onSubmitCreacion(): void {
  //   if (this.solicitudForm.invalid) {
  //     this.solicitudForm.markAllAsTouched();
  //     console.error('El formulario de creación tiene errores de validación.');
  //     return;
  //   }

  //   this.cargandoCreacion = true;
  //   this.errorComunicacionCreacion = false;

  //   const nuevaSolicitud: Solicitud = {
  //     id: 0, // Backend auto-increments
  //     cliente: this.solicitudForm.value.cliente,
  //     email_cliente: this.solicitudForm.value.email_cliente,
  //     fecha_solicitud: new Date().toISOString(), // Backend sets this
  //     estado: 'Abierta', // Initial state
  //     observaciones: this.solicitudForm.value.observaciones,
  //     fecha_ultima_modificacion: new Date().toISOString(), // Backend sets this
  //     servicios: this.solicitudForm.value.servicios.map((s: any) => ({
  //       id_servicio: 0, // Backend auto-increments
  //       id_solicitud: 0, // Backend assigns this
  //       nombre_servicio: s.nombre_servicio,
  //       fecha_reunion: s.fecha_reunion,
  //       estado_servicio: 'Pendiente', // Initial state
  //       comentarios: s.comentarios,
  //       costo_estimado: s.costo_estimado
  //     }))
  //   };

  //   this.solicitudService.createSolicitud(nuevaSolicitud).subscribe({
  //     next: (response) => {
  //       console.log('Solicitud creada con éxito:', response);
  //       this.cargandoCreacion = false;
  //       this.mostrarFormularioCreacion = false; // Hide the form after successful creation
  //       this.solicitudForm.reset(); // Reset the form fields
  //       this.initSolicitudForm(); // Re-initialize to ensure services array is correctly reset
  //       this.cargarSolicitudes(); // Refresh the list of requests
  //     },
  //     error: (error) => {
  //       console.error('Error al crear la solicitud:', error);
  //       this.cargandoCreacion = false;
  //       this.errorComunicacionCreacion = true;
  //     }
  //   });
  // }

  // --- Method to toggle form visibility ---
  toggleFormularioCreacion(): void {
    this.mostrarFormularioCreacion = !this.mostrarFormularioCreacion;
    if (this.mostrarFormularioCreacion) {
      this.solicitudForm.reset(); // Reset form when showing
      this.initSolicitudForm(); // Ensure a fresh form with default service
    }
  }
  // --- End new methods for form ---

  cargarSolicitudes(): void {
    this.cargando = true;

    const params = {
      page: this.paginaActual,
      size: 10,
      ...this.filtros
    };

    this.solicitudService.getSolicitudes(params).subscribe({
      next: (response: PagedResponse<Solicitud>) => {
        this.solicitudes = response.content;
        this.totalPaginas = response.totalPages;
        this.totalRegistros = response.totalElements;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  cambiarPagina(nuevaPagina: number): void {
    this.paginaActual = nuevaPagina;
    this.cargarSolicitudes();
  }

  aplicarFiltros(): void {
    this.paginaActual = 1;
    this.cargarSolicitudes();
  }

  limpiarFiltros(): void {
    this.filtros = { estado: '', cliente: '' };
    this.aplicarFiltros();
  }

  verDetalle(id: number): void {
    this.router.navigate(['/solicitudes', id]);
  }

  editarSolicitud(id: number): void {
    this.router.navigate(['/solicitudes/editar', id]);
  }

  // eliminarSolicitud(id: number): void {
  //   if (!confirm('¿Estás seguro de que deseas eliminar esta solicitud?')) return;

  //   this.solicitudService.deleteSolicitud(id).subscribe(() => {
  //     this.cargarSolicitudes();
  //   });
  // }


   // Mostrar modal de creación
  abrirModalCreacion(): void {
    this.mostrarFormularioCreacion = true;
    this.solicitudForm.reset();
    this.initSolicitudForm();
  }

  // Cerrar modal de creación
  cerrarModal(): void {
    this.mostrarFormularioCreacion = false;
    this.solicitudForm.reset();
    this.initSolicitudForm();
    this.errorComunicacionCreacion = false;
  }

  // Confirmación de eliminación con SweetAlert2
  confirmarEliminar(id: number): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'No podrá revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.eliminarSolicitud(id);
      }
    });
  }

  // Eliminar solicitud
  eliminarSolicitud(id: number): void {
    this.solicitudService.deleteSolicitud(id).subscribe({
      next: () => {
        this.cargarSolicitudes();
        Swal.fire('Eliminado', 'La solicitud ha sido eliminada', 'success');
      },
      error: () => {
        Swal.fire('Error', 'No se pudo eliminar la solicitud', 'error');
      }
    });
  }

  // Submit de creación con SweetAlert2
  onSubmitCreacion(): void {
    if (this.solicitudForm.invalid) {
      this.solicitudForm.markAllAsTouched();
      Swal.fire({
        icon: 'error',
        title: 'Formulario inválido',
        text: 'Por favor corrija los errores antes de continuar'
      });
      return;
    }

    this.cargandoCreacion = true;

    const nuevaSolicitud: Solicitud = {
      id: 0,
      cliente: this.solicitudForm.value.cliente,
      email_cliente: this.solicitudForm.value.email_cliente,
      fecha_solicitud: new Date().toISOString(),
      estado: 'Abierta',
      observaciones: this.solicitudForm.value.observaciones,
      fecha_ultima_modificacion: new Date().toISOString(),
      servicios: this.solicitudForm.value.servicios.map((s: any) => ({
        id_servicio: 0,
        id_solicitud: 0,
        nombre_servicio: s.nombre_servicio,
        fecha_reunion: s.fecha_reunion,
        estado_servicio: 'Pendiente',
        comentarios: s.comentarios,
        costo_estimado: s.costo_estimado
      }))
    };

    this.solicitudService.createSolicitud(nuevaSolicitud).subscribe({
      next: (response) => {
        this.cargandoCreacion = false;
        this.cerrarModal();
        this.cargarSolicitudes();

        Swal.fire({
          icon: 'success',
          title: 'Creado',
          text: 'Solicitud creada exitosamente',
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: (error) => {
        this.cargandoCreacion = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al crear la solicitud'
        });
      }
    });
  }



}


