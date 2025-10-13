import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { environment } from "@/environments/environment";

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Adicionar headers padrão
    const apiReq = req.clone({
      setHeaders: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return next.handle(apiReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error("API Error:", error);
        return throwError(() => error);
      })
    );
  }
}
