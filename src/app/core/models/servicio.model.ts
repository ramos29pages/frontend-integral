// export interface Servicio {
//   idServicio?: number;
//   idSolicitud?: number; // Parent request ID
//   nombreServicio: string;
//   fechaReunion: string; // ISO 8601 date-time string, must be future
//   estadoServicio: 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Vencido';
//   comentarios?: string;
//   costoEstimado?: number; // Only if 'Aprobado'
// }

export interface Servicio {
  id_servicio?: number; // Opcional para creación, requerido para actualización
  id_solicitud?: number; // Opcional para creación, asignado por el backend
  nombre_servicio: string;
  fecha_reunion: string; // Formato ISO string (YYYY-MM-DD)
  estado_servicio: 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Vencido';
  comentarios?: string;
  costo_estimado?: number;
}
