import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment.development";
import { ToastrService } from "ngx-toastr";
@Injectable({
  providedIn: 'root'
})
export class GenericServices {
  private toastr = inject(ToastrService);
    private http = inject(HttpClient);
  private baseUrl = environment.apiUrl; 

  // Generic HTTP Methods
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

  // Toast Notifications
  showSuccess(message: string, title?: string) {
    this.toastr.success(message, title);
  }
  showError(message: string, title?: string) {
    this.toastr.error(message, title);
  }
  showInfo(message: string, title?: string) {
    this.toastr.info(message, title);
  }
  showWarning(message: string, title?: string) {
    this.toastr.warning(message, title);
  }
}