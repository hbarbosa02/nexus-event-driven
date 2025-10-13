import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, map, catchError, throwError } from "rxjs";
import { environment } from "@/environments/environment";
import {
  Event,
  CreateEventRequest,
  UpdateEventRequest,
  EventQueryParams,
  PaginatedResult,
  EventStatus,
} from "@/app/shared/models/event.model";

@Injectable({
  providedIn: "root",
})
export class EventService {
  private readonly apiUrl = environment.apiUrl + "/events";

  constructor(private http: HttpClient) {}

  getEvents(params?: EventQueryParams): Observable<PaginatedResult<Event>> {
    const httpParams = this.buildHttpParams(params);

    return this.http
      .get<PaginatedResult<Event>>(this.apiUrl, { params: httpParams })
      .pipe(
        map((response) => ({
          data: response.data.map((event) => this.mapEvent(event)),
          pagination: response.pagination,
        })),
        catchError(this.handleError)
      );
  }

  getEventById(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`).pipe(
      map((event) => this.mapEvent(event)),
      catchError(this.handleError)
    );
  }

  createEvent(event: CreateEventRequest): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, event).pipe(
      map((event) => this.mapEvent(event)),
      catchError(this.handleError)
    );
  }

  updateEvent(id: string, event: UpdateEventRequest): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, event).pipe(
      map((event) => this.mapEvent(event)),
      catchError(this.handleError)
    );
  }

  deleteEvent(id: string): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  retryEvent(id: string, maxRetries: number = 5): Observable<Event> {
    return this.http
      .post<Event>(`${this.apiUrl}/${id}/retry`, { maxRetries })
      .pipe(
        map((event) => this.mapEvent(event)),
        catchError(this.handleError)
      );
  }

  private buildHttpParams(params?: EventQueryParams): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return httpParams;
  }

  private mapEvent(event: any): Event {
    return {
      ...event,
      startTime: event.startTime ? new Date(event.startTime) : null,
      endTime: event.endTime ? new Date(event.endTime) : null,
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt),
      deletedAt: event.deletedAt ? new Date(event.deletedAt) : null,
    };
  }

  private handleError(error: any): Observable<never> {
    console.error("API Error:", error);
    return throwError(() => new Error(error.message || "An error occurred"));
  }
}
