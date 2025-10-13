import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, catchError, throwError } from "rxjs";
import { environment } from "@/environments/environment";

export interface DocSection {
  id: string;
  title: string;
  content: string;
  category: string;
}

@Injectable({
  providedIn: "root",
})
export class DocService {
  private readonly docsUrl = environment.apiUrl + "/docs";

  constructor(private http: HttpClient) {}

  getDocSections(): Observable<DocSection[]> {
    return this.http
      .get<DocSection[]>(`${this.docsUrl}/sections`)
      .pipe(catchError(this.handleError));
  }

  getDocSection(id: string): Observable<DocSection> {
    return this.http
      .get<DocSection>(`${this.docsUrl}/sections/${id}`)
      .pipe(catchError(this.handleError));
  }

  searchDocs(query: string): Observable<DocSection[]> {
    return this.http
      .get<DocSection[]>(`${this.docsUrl}/search`, {
        params: { q: query },
      })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error("Doc Service Error:", error);
    return throwError(() => new Error(error.message || "An error occurred"));
  }
}
