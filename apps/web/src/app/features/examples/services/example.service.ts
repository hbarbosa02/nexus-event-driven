import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, map, catchError, throwError } from "rxjs";
import { environment } from "@/environments/environment";
import {
  Example,
  CreateExampleRequest,
  UpdateExampleRequest,
  ExampleQueryParams,
} from "@/app/shared/models/example.model";
import { PaginatedResult } from "@/app/shared/models/event.model";

@Injectable({
  providedIn: "root",
})
export class ExampleService {
  private readonly apiUrl = environment.apiUrl + "/examples";

  constructor(private http: HttpClient) {}

  getExamples(
    params?: ExampleQueryParams
  ): Observable<PaginatedResult<Example>> {
    const httpParams = this.buildHttpParams(params);

    return this.http
      .get<PaginatedResult<Example>>(this.apiUrl, { params: httpParams })
      .pipe(
        map((response) => ({
          data: response.data.map((example) => this.mapExample(example)),
          pagination: response.pagination,
        })),
        catchError(this.handleError)
      );
  }

  getActiveExamples(): Observable<PaginatedResult<Example>> {
    return this.http
      .get<PaginatedResult<Example>>(`${this.apiUrl}/active`)
      .pipe(
        map((response) => ({
          data: response.data.map((example) => this.mapExample(example)),
          pagination: response.pagination,
        })),
        catchError(this.handleError)
      );
  }

  getExampleById(id: string): Observable<Example> {
    return this.http.get<Example>(`${this.apiUrl}/${id}`).pipe(
      map((example) => this.mapExample(example)),
      catchError(this.handleError)
    );
  }

  createExample(example: CreateExampleRequest): Observable<Example> {
    return this.http.post<Example>(this.apiUrl, example).pipe(
      map((example) => this.mapExample(example)),
      catchError(this.handleError)
    );
  }

  updateExample(
    id: string,
    example: UpdateExampleRequest
  ): Observable<Example> {
    return this.http.put<Example>(`${this.apiUrl}/${id}`, example).pipe(
      map((example) => this.mapExample(example)),
      catchError(this.handleError)
    );
  }

  deleteExample(id: string): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private buildHttpParams(params?: ExampleQueryParams): HttpParams {
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

  private mapExample(example: any): Example {
    return {
      ...example,
      createdAt: new Date(example.createdAt),
      updatedAt: new Date(example.updatedAt),
      deletedAt: example.deletedAt ? new Date(example.deletedAt) : null,
    };
  }

  private handleError(error: any): Observable<never> {
    console.error("API Error:", error);
    return throwError(() => new Error(error.message || "An error occurred"));
  }
}
