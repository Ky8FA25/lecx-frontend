import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedModule } from '../../../../core/shared/sharedModule';
import { MaterialService } from '../../services/material.service';
import { StorageService } from '../../services/storage.service';
import { GenericServices } from '../../../../core/services/GenericServices';
import { CourseMaterialDTO, CreateCourseMaterialDto, UpdateCourseMaterialDto } from '../../models/instructor.models';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FileType } from '../../../../core/enums/enums';
import { GoogleStoragePaths } from '../../../../core/models/google-storage-paths';

@Component({
  selector: 'app-instructor-material-list',
  standalone: true,
  imports: [SharedModule, CommonModule, ReactiveFormsModule],
  templateUrl: './material-list.html',
  styleUrl: './material-list.scss'
})
export class InstructorMaterialList implements OnInit {
  private route = inject(ActivatedRoute);
  private materialService = inject(MaterialService);
  private storageService = inject(StorageService);
  private genericService = inject(GenericServices);

  courseId = signal<number | null>(null);
  materials = signal<CourseMaterialDTO[]>([]);
  loading = signal(false);
  uploading = signal(false);
  updating = signal(false);

  // Modals
  showCreateModal = signal(false);
  showUpdateModal = signal(false);
  showDeleteModal = signal(false);
  selectedMaterial = signal<CourseMaterialDTO | null>(null);

  // Forms
  createForm = new FormGroup({
    file: new FormControl<File | null>(null, [Validators.required]),
    fileType: new FormControl<number>(FileType.Document, [Validators.required]),
    fileName: new FormControl<string>('', [Validators.required]),
    materialsLink: new FormControl<string>('')
  });

  updateForm = new FormGroup({
    fileName: new FormControl<string>('', [Validators.required]),
    fileType: new FormControl<number>(FileType.Document, [Validators.required]),
    materialsLink: new FormControl<string>('')
  });

  ngOnInit() {
    this.route.params.subscribe(params => {
      const courseId = params['courseId'];
      if (courseId) {
        this.courseId.set(Number(courseId));
        this.loadMaterials();
      }
    });
  }

  loadMaterials() {
    const courseId = this.courseId();
    if (!courseId) return;

    this.loading.set(true);
    this.materialService.getMaterialsByCourse(courseId).subscribe({
      next: (response: any) => {
        console.log('✅ Materials API Response:', response);
        
        let materialsToSet: CourseMaterialDTO[] = [];
        
        // Handle different response formats
        if (response) {
          // Format 1: { success: true, data: [...] }
          if (response.success && response.data && Array.isArray(response.data)) {
            materialsToSet = response.data;
          }
          // Format 2: Direct array
          else if (Array.isArray(response)) {
            materialsToSet = response;
          }
          // Format 3: { data: [...] } without success
          else if (response.data && Array.isArray(response.data)) {
            materialsToSet = response.data;
          }
        }
        
        // API returns fileName but DTO uses fIleName, so we need to map it
        // Just ensure uploadDate is converted to Date object if it's a string
        materialsToSet = materialsToSet.map((material: any) => {
          return {
            ...material,
            fIleName: material.fileName || material.fIleName || '', // Map fileName to fIleName
            uploadDate: material.uploadDate ? new Date(material.uploadDate) : new Date()
          } as CourseMaterialDTO;
        });
        
        console.log('✅ Mapped materials:', materialsToSet);
        this.materials.set(materialsToSet);
        console.log('✅ Loaded', materialsToSet.length, 'materials');
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Failed to load materials:', err);
        this.genericService.showError(err.error?.message || 'Failed to load materials');
        this.loading.set(false);
      }
    });
  }

  openCreateModal() {
    this.createForm.reset({
      file: null,
      fileType: FileType.Document,
      fileName: '',
      materialsLink: ''
    });
    this.showCreateModal.set(true);
  }

  openUpdateModal(material: CourseMaterialDTO) {
    this.selectedMaterial.set(material);
    this.showUpdateModal.set(true);
    
    // Use setTimeout to ensure form is rendered before setting values
    setTimeout(() => {
      // Reset form first to clear any previous values
      this.updateForm.reset();
      
      // Set values from material using setValue to ensure all fields are set
      const fileNameValue = material.fIleName || '';
      const fileTypeValue = material.fileType !== undefined && material.fileType !== null ? material.fileType : FileType.Document;
      const materialsLinkValue = material.materialsLink || '';
      
      console.log('📋 Setting form values:', {
        fileName: fileNameValue,
        fileType: fileTypeValue,
        materialsLink: materialsLinkValue,
        originalMaterial: material
      });
      
      this.updateForm.setValue({
        fileName: fileNameValue,
        fileType: fileTypeValue,
        materialsLink: materialsLinkValue
      });
      
      // Mark form as pristine and untouched to avoid showing validation errors immediately
      this.updateForm.markAsPristine();
      this.updateForm.markAsUntouched();
      
      console.log('📋 Form values after setValue:', this.updateForm.value);
      console.log('📋 Form control fileName value:', this.updateForm.get('fileName')?.value);
    }, 0);
  }

  openDeleteModal(material: CourseMaterialDTO) {
    this.selectedMaterial.set(material);
    this.showDeleteModal.set(true);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.createForm.patchValue({ file: file });
      
      // Auto-set fileName from file name
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      this.createForm.patchValue({ fileName: fileNameWithoutExt });
      
      // Auto-detect fileType based on extension
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      let fileType = FileType.Document;
      
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
        fileType = FileType.Image;
      } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(ext)) {
        fileType = FileType.Video;
      } else if (['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xlsx', 'txt'].includes(ext)) {
        fileType = FileType.Document;
      } else {
        fileType = FileType.Other;
      }
      
      this.createForm.patchValue({ fileType: fileType });
      
      // Auto-set fileExtension
      this.createForm.patchValue({ 
        materialsLink: file.name // Temporary, will be replaced with uploaded URL
      });
    }
  }

  async onCreateSubmit() {
    if (!this.createForm.valid || !this.courseId()) {
      this.createForm.markAllAsTouched();
      this.genericService.showError('Please fill in all required fields');
      return;
    }

    const formValue = this.createForm.value;
    const file = formValue.file;
    
    if (!file) {
      this.genericService.showError('Please select a file');
      return;
    }

    this.uploading.set(true);

    try {
      // Upload file using Storage API with CourseMaterials path
      const storagePath = GoogleStoragePaths.Public.CourseMaterials;
      console.log('📤 Uploading file to Storage API...');
      console.log('📁 Storage Path:', storagePath);
      console.log('📄 File Name:', file.name);
      console.log('📏 File Size:', file.size, 'bytes');
      
      const uploadResponse = await this.storageService.uploadFile(
        file, 
        storagePath
      ).toPromise();
      
      console.log('✅ Storage API Response:', uploadResponse);
      
      if (!uploadResponse?.success || !uploadResponse.publicUrl) {
        this.genericService.showError('Failed to upload file: Invalid response from server');
        this.uploading.set(false);
        return;
      }

      // Get file extension (ensure it's not empty)
      const fileNameParts = file.name.split('.');
      const fileExtension = fileNameParts.length > 1 ? fileNameParts.pop()?.toLowerCase() || 'unknown' : 'unknown';

      // Get fileName without extension
      const fileNameWithoutExt = formValue.fileName?.trim() || file.name.replace(/\.[^/.]+$/, '').trim();
      
      // Validate required fields
      if (!fileNameWithoutExt) {
        this.genericService.showError('File name is required');
        this.uploading.set(false);
        return;
      }

      // Ensure fileType is a number
      const fileTypeValue = typeof formValue.fileType === 'string' ? parseInt(formValue.fileType, 10) : Number(formValue.fileType);
      if (isNaN(fileTypeValue) || fileTypeValue < 0 || fileTypeValue > 3) {
        this.genericService.showError('Invalid file type. Please select a valid type.');
        this.uploading.set(false);
        return;
      }

      // Create material DTO
      const createDto: CreateCourseMaterialDto = {
        courseId: this.courseId()!,
        fileType: fileTypeValue,
        fIleName: fileNameWithoutExt,
        fileExtension: fileExtension,
        materialsLink: uploadResponse.publicUrl
      };

      console.log('📤 Creating material with DTO:', createDto);
      console.log('📤 Request body will be sent as:', JSON.stringify(createDto, null, 2));

      this.materialService.createMaterial(createDto).subscribe({
        next: (response: any) => {
          this.uploading.set(false);
          console.log('✅ Create material response:', response);
          
          // Handle different response formats
          const isSuccess = response?.success === true || response?.success === undefined;
          
          if (isSuccess) {
            this.genericService.showSuccess(response?.message || 'Material created successfully');
            this.showCreateModal.set(false);
            this.createForm.reset();
            this.loadMaterials();
          } else {
            this.genericService.showError(response?.message || 'Failed to create material');
          }
        },
        error: (err: any) => {
          this.uploading.set(false);
          console.error('❌ Error creating material:', err);
          console.error('❌ Full error object:', JSON.stringify(err, null, 2));
          console.error('❌ Error details:', {
            status: err.status,
            statusText: err.statusText,
            url: err.url,
            error: err.error,
            errors: err.error?.errors,
            message: err.error?.message,
            title: err.error?.title,
            detail: err.error?.detail
          });
          
          // Handle validation errors (400 Bad Request)
          if (err.status === 400) {
            if (err.error?.errors) {
              const validationErrors = err.error.errors;
              const errorMessages: string[] = [];
              
              // Extract validation error messages
              Object.keys(validationErrors).forEach(key => {
                const messages = validationErrors[key];
                if (Array.isArray(messages)) {
                  messages.forEach((msg: string) => {
                    errorMessages.push(`${key}: ${msg}`);
                  });
                } else {
                  errorMessages.push(`${key}: ${messages}`);
                }
              });
              
              if (errorMessages.length > 0) {
                this.genericService.showError(`Validation errors:\n${errorMessages.join('\n')}`);
              } else {
                this.genericService.showError(err.error?.message || err.error?.detail || 'Validation failed. Please check your input.');
              }
            } else if (err.error?.message) {
              this.genericService.showError(err.error.message);
            } else if (err.error?.detail) {
              this.genericService.showError(err.error.detail);
            } else {
              this.genericService.showError('Validation failed. Please check your input and try again.');
            }
          } 
          // Handle unauthorized (401)
          else if (err.status === 401) {
            this.genericService.showError('Unauthorized. Please login again.');
          }
          // Handle forbidden (403)
          else if (err.status === 403) {
            this.genericService.showError('You do not have permission to create materials.');
          }
          // Handle server errors (500+)
          else if (err.status >= 500) {
            this.genericService.showError('Server error. Please try again later.');
          }
          // Other errors
          else {
            const errorMsg = err.error?.message || err.error?.detail || err.message || 'Failed to create material. Please try again.';
            this.genericService.showError(errorMsg);
          }
        }
      });
    } catch (err: any) {
      this.uploading.set(false);
      console.error('❌ Error uploading file:', err);
      this.genericService.showError(err.error?.message || 'Failed to upload file. Please try again.');
    }
  }

  async onUpdateSubmit() {
    if (!this.updateForm.valid || !this.selectedMaterial()) {
      this.updateForm.markAllAsTouched();
      this.genericService.showError('Please fill in all required fields');
      return;
    }

    const material = this.selectedMaterial()!;
    const formValue = this.updateForm.value;

    this.updating.set(true);

    // Ensure fileType is a number
    const fileTypeValue = formValue.fileType !== null && formValue.fileType !== undefined 
      ? (typeof formValue.fileType === 'string' ? parseInt(formValue.fileType, 10) : Number(formValue.fileType))
      : null;
    
    if (fileTypeValue !== null && (isNaN(fileTypeValue) || fileTypeValue < 0 || fileTypeValue > 3)) {
      this.genericService.showError('Invalid file type. Please select a valid type.');
      this.updating.set(false);
      return;
    }

    // Build update DTO
    // Backend requires courseId to be present (can be null or existing value)
    const updateDto: UpdateCourseMaterialDto = {
      materialId: material.materialId,
      courseId: material.courseId, // Keep existing courseId
      fIleName: formValue.fileName && formValue.fileName.trim() ? formValue.fileName.trim() : null,
      fileType: fileTypeValue !== null && fileTypeValue !== undefined ? fileTypeValue : null,
      materialsLink: formValue.materialsLink && formValue.materialsLink.trim() ? formValue.materialsLink.trim() : null,
      fileExtension: material.fileExtension // Keep existing fileExtension
    };

    console.log('📤 Updating material with DTO:', updateDto);
    console.log('📤 Request body will be sent as:', JSON.stringify(updateDto, null, 2));

    this.materialService.updateMaterial(updateDto as UpdateCourseMaterialDto).subscribe({
      next: (response: any) => {
        this.updating.set(false);
        console.log('✅ Update material response:', response);
        
        // Handle different response formats
        const isSuccess = response?.success === true || response?.success === undefined;
        
        if (isSuccess) {
          this.genericService.showSuccess(response?.message || 'Material updated successfully');
          this.showUpdateModal.set(false);
          this.loadMaterials();
        } else {
          this.genericService.showError(response?.message || 'Failed to update material');
        }
      },
      error: (err: any) => {
        this.updating.set(false);
        console.error('❌ Error updating material:', err);
        console.error('❌ Full error object:', JSON.stringify(err, null, 2));
        console.error('❌ Error details:', {
          status: err.status,
          statusText: err.statusText,
          url: err.url,
          error: err.error,
          errors: err.error?.errors,
          message: err.error?.message,
          title: err.error?.title,
          detail: err.error?.detail
        });
        
        // Handle validation errors (400 Bad Request)
        if (err.status === 400) {
          if (err.error?.errors) {
            const validationErrors = err.error.errors;
            const errorMessages: string[] = [];
            
            // Extract validation error messages
            Object.keys(validationErrors).forEach(key => {
              const messages = validationErrors[key];
              if (Array.isArray(messages)) {
                messages.forEach((msg: string) => {
                  errorMessages.push(`${key}: ${msg}`);
                });
              } else {
                errorMessages.push(`${key}: ${messages}`);
              }
            });
            
            if (errorMessages.length > 0) {
              this.genericService.showError(`Validation errors:\n${errorMessages.join('\n')}`);
            } else {
              this.genericService.showError(err.error?.message || err.error?.detail || 'Validation failed. Please check your input.');
            }
          } else if (err.error?.message) {
            this.genericService.showError(err.error.message);
          } else if (err.error?.detail) {
            this.genericService.showError(err.error.detail);
          } else {
            this.genericService.showError('Validation failed. Please check your input and try again.');
          }
        } 
        // Handle unauthorized (401)
        else if (err.status === 401) {
          this.genericService.showError('Unauthorized. Please login again.');
        }
        // Handle forbidden (403)
        else if (err.status === 403) {
          this.genericService.showError('You do not have permission to update materials.');
        }
        // Handle server errors (500+)
        else if (err.status >= 500) {
          this.genericService.showError('Server error. Please try again later.');
        }
        // Other errors
        else {
          const errorMsg = err.error?.message || err.error?.detail || err.message || 'Failed to update material. Please try again.';
          this.genericService.showError(errorMsg);
        }
      }
    });
  }

  onDeleteSubmit() {
    const material = this.selectedMaterial();
    if (!material) return;

    this.materialService.deleteMaterial(material.materialId).subscribe({
      next: (response: any) => {
        console.log('✅ Delete material response:', response);
        
        // Handle different response formats
        const isSuccess = response?.success === true || response?.success === undefined;
        
        if (isSuccess) {
          this.genericService.showSuccess(response?.message || 'Material deleted successfully');
          this.showDeleteModal.set(false);
          this.loadMaterials();
        } else {
          this.genericService.showError(response?.message || 'Failed to delete material');
        }
      },
      error: (err: any) => {
        console.error('❌ Error deleting material:', err);
        this.genericService.showError(err.error?.message || 'Failed to delete material. Please try again.');
      }
    });
  }

  getFileTypeLabel(fileType: number): string {
    const map: { [key: number]: string } = {
      [FileType.Image]: 'Image',
      [FileType.Video]: 'Video',
      [FileType.Document]: 'Document',
      [FileType.Other]: 'Other'
    };
    return map[fileType] || 'Unknown';
  }

  getFileIcon(fileExtension: string, fileType: number): string {
    const ext = fileExtension.toLowerCase();
    
    if (fileType === FileType.Image) {
      return 'fas fa-image';
    } else if (fileType === FileType.Video) {
      return 'fas fa-video';
    } else if (ext === 'pdf') {
      return 'fas fa-file-pdf';
    } else if (['doc', 'docx'].includes(ext)) {
      return 'fas fa-file-word';
    } else if (['ppt', 'pptx'].includes(ext)) {
      return 'fas fa-file-powerpoint';
    } else if (['xls', 'xlsx'].includes(ext)) {
      return 'fas fa-file-excel';
    } else {
      return 'fas fa-file';
    }
  }

  downloadMaterial(material: CourseMaterialDTO) {
    if (material.materialsLink) {
      window.open(material.materialsLink, '_blank');
    }
  }
}

