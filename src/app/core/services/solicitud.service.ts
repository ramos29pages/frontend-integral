import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Solicitud, PagedResponse } from '../models/solicitud.model';
import { API_BASE_URL } from '../constants/api.constants';
import { Servicio } from '../models/servicio.model';

@Injectable({
  providedIn: 'root',
})
export class SolicitudService {
  private apiUrl = `${API_BASE_URL}/solicitudes`;
  private servicioApiUrl = `${API_BASE_URL}/servicios`;

  constructor(private http: HttpClient) {}

  getSolicitudes(filters?: {
    estado?: string;
    cliente?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    page?: number;
    size?: number;
  }): Observable<PagedResponse<Solicitud>> {
    let params = new HttpParams();
    if (filters?.estado) params = params.append('estado', filters.estado);
    if (filters?.cliente) params = params.append('cliente', filters.cliente);
    if (filters?.fechaDesde)
      params = params.append('fechaDesde', filters.fechaDesde);
    if (filters?.fechaHasta)
      params = params.append('fechaHasta', filters.fechaHasta);
    if (filters?.page) params = params.append('page', filters.page.toString());
    if (filters?.size) params = params.append('size', filters.size.toString());

    return this.http.get<PagedResponse<Solicitud>>(this.apiUrl, { params });
  }

  getSolicitudById(id: number): Observable<Solicitud> {
    return this.http.get<Solicitud>(`${this.apiUrl}/${id}`);
  }

  createSolicitud(solicitud: Solicitud): Observable<Solicitud> {
    return this.http.post<Solicitud>(this.apiUrl, solicitud);
  }

  updateSolicitud(
    id: number,
    solicitudUpdate: {
      cliente?: string;
      email_cliente?: string;
      estado?: 'Abierta' | 'En Proceso' | 'Cerrada' | 'Cancelada';
      observaciones?: string;
    }
  ): Observable<Solicitud> {
    // Este endpoint solo actualiza los campos principales de la solicitud, no los servicios anidados.
    return this.http.put<Solicitud>(`${this.apiUrl}/${id}`, solicitudUpdate);
  }

  deleteSolicitud(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addServiceToSolicitud(
    solicitudId: number,
    servicio: Servicio
  ): Observable<Servicio> {
    // Envía solo los campos necesarios para la creación de un servicio
    const payload = {
      nombre_servicio: servicio.nombre_servicio,
      fecha_reunion: servicio.fecha_reunion,
      comentarios: servicio.comentarios,
      costo_estimado: servicio.costo_estimado,
    };
    return this.http.post<Servicio>(
      `${this.apiUrl}/${solicitudId}/servicios`,
      payload
    );
  }

  updateService(
    servicioId: number,
    servicioUpdate: Partial<Servicio>
  ): Observable<Servicio> {
    // Partial permite enviar solo los campos que han cambiado
    return this.http.put<Servicio>(
      `${this.servicioApiUrl}/${servicioId}`,
      servicioUpdate
    );
  }

  deleteService(servicioId: number): Observable<void> {
    return this.http.delete<void>(`${this.servicioApiUrl}/${servicioId}`);
  }
}
