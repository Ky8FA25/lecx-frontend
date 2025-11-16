import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { environment } from "../../../environments/environment.development";
import { ToastrService } from "ngx-toastr";
import { Title } from "@angular/platform-browser";
@Injectable({
  providedIn: 'root'
})
export class GenericServices {
  private toastr = inject(ToastrService);
    private http = inject(HttpClient);
  private baseUrl = environment.apiBEUrl; 
  private titleService = inject(Title);

  getWithHeaders(url: string, headers: any) {
  return this.http.get(`${environment.apiBEUrl}/${url}`, { headers });
}
  // Generic HTTP Methods
  get<T>(url: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${url}`);
  }

  getWithParams<T>(url: string, ): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${url}`);
  }

  post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${url}`, body);
  }

  put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${url}`, body);
  }

  patch<T>(url: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${url}`, body);
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${url}`);
  }

  getWithFilter(url : string,filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params = params.set(key, filters[key]);
        }
      });
    }

    return this.http.get(`${this.baseUrl}${url}`, { params });
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

  // set title
  SetTitle(param : string) {
    this.titleService.setTitle(param);
  }
}