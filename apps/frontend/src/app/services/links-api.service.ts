import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiError, Link } from '../models/link.model';

@Injectable({ providedIn: 'root' })
export class LinksApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/links`;

  create(url: string): Observable<Link> {
    return this.http
      .post<Link>(this.baseUrl, { url })
      .pipe(catchError((error) => this.handleError(error)));
  }

  findAll(): Observable<Link[]> {
    return this.http
      .get<Link[]>(this.baseUrl)
      .pipe(catchError((error) => this.handleError(error)));
  }

  private handleError(error: unknown): Observable<never> {
    return throwError(() => new Error(this.toErrorMessage(error)));
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as ApiError | undefined;
      if (body?.message) {
        return body.message;
      }
      if (error.status === 0) {
        return 'Não foi possível conectar à API. O servidor está rodando?';
      }
      return `Falha na requisição (${error.status})`;
    }

    return 'Algo deu errado. Tente novamente.';
  }
}
