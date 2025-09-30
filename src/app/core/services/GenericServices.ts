import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment.development";

export class GenericServices {
    private http = inject(HttpClient);
  private baseUrl = environment.apiUrl; 

  get<T>(url: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${url}`);
  }

  post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${url}`, body);
  }

  put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${url}`, body);
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${url}`);
  }
}