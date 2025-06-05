import { Servicio } from "./servicio.model";

export interface Solicitud {
  id: number;
  cliente: string;
  email_cliente: string;
  fecha_solicitud: string;
  estado: 'Abierta' | 'En Proceso' | 'Cerrada' | 'Cancelada';
  observaciones?: string;
  fecha_ultima_modificacion?: string;
  servicios?: Servicio[];
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
