import { inject, Injectable } from '@angular/core';
import { GenericServices } from '../../../core/services/GenericServices';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../core/models/generic-response-class';

export interface UploadFileResponse {
  success: boolean;
  objectName: string;
  publicUrl: string;
  fileName: string;
}

export interface SignedUrlResponse {
  success: boolean;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private genericService = inject(GenericServices);

  // Upload file (for small files < 20MB)
  uploadFile(file: File, prefix?: string): Observable<ApiResponse<UploadFileResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    if (prefix) {
      formData.append('prefix', prefix);
    }
    
    return this.genericService.post<ApiResponse<UploadFileResponse>>('api/storage/upload', formData);
  }

  // Get signed read URL
  getSignedReadUrl(objectName: string, ttlSeconds: number = 300): Observable<ApiResponse<SignedUrlResponse>> {
    return this.genericService.get<ApiResponse<SignedUrlResponse>>(
      `api/storage/signed-read?objectName=${objectName}&ttlSeconds=${ttlSeconds}`
    );
  }

  // Get signed write URL (for direct upload)
  getSignedWriteUrl(objectName: string, contentType: string = 'application/octet-stream', ttlSeconds: number = 300): Observable<ApiResponse<SignedUrlResponse>> {
    return this.genericService.get<ApiResponse<SignedUrlResponse>>(
      `api/storage/signed-write?objectName=${objectName}&contentType=${contentType}&ttlSeconds=${ttlSeconds}`
    );
  }

  // Get signed resumable URL (for chunked upload)
  getSignedResumableUrl(objectName: string, contentType: string = 'application/octet-stream', ttlSeconds: number = 300): Observable<ApiResponse<SignedUrlResponse>> {
    return this.genericService.get<ApiResponse<SignedUrlResponse>>(
      `api/storage/signed-resumable?objectName=${objectName}&contentType=${contentType}&ttlSeconds=${ttlSeconds}`
    );
  }

  // Delete object (Admin only)
  deleteObject(objectName: string): Observable<ApiResponse<any>> {
    return this.genericService.post<ApiResponse<any>>('api/storage/delete-object', { objectName });
  }
}

