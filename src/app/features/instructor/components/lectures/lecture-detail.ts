import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InstructorLectureService } from '../../services/lecture.service';
import { CommentService } from '../../services/comment.service';
import { StorageService } from '../../services/storage.service';
import { GenericServices } from '../../../../core/services/GenericServices';
import { LectureDTO, LectureFileDTO, UpdateLectureDto, CreateLectureFileDto } from '../../models/instructor.models';
import { CommentDTO, CreateCommentDto } from '../../models/instructor.models';
import { PaginatedResponse } from '../../../../core/models/generic-response-class';

@Component({
  selector: 'app-instructor-lecture-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lecture-detail.html',
  styleUrl: './lecture-detail.scss'
})
export class InstructorLectureDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private lectureService = inject(InstructorLectureService);
  private commentService = inject(CommentService);
  private storageService = inject(StorageService);
  private genericService = inject(GenericServices);

  lectureId = signal<number | null>(null);
  courseId = signal<number | null>(null);
  lecture = signal<LectureDTO | null>(null);
  loading = signal<boolean>(false);
  
  // Video and documents
  videoFile = signal<LectureFileDTO | null>(null);
  documentFiles = signal<LectureFileDTO[]>([]);
  
  // Comments
  comments = signal<CommentDTO[]>([]);
  commentPageIndex = signal<number>(1);
  commentPageSize = signal<number>(10);
  commentTotalPages = signal<number>(0);
  newCommentContent = signal<string>('');
  commentFile: File | null = null;
  
  
  // Modals
  showUpdateModal = signal<boolean>(false);
  showDeleteModal = signal<boolean>(false);
  showUploadVideoModal = signal<boolean>(false);
  showUploadDocumentModal = signal<boolean>(false);
  
  // Form data
  updateTitle = signal<string>('');
  updateDescription = signal<string>('');
  uploadVideoFile: File | null = null;
  uploadDocumentFiles: File[] = [];
  
  // Loading states
  uploadingVideo = signal<boolean>(false);
  uploadingDocuments = signal<boolean>(false);
  uploadingComment = signal<boolean>(false);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const lectureId = +params['lectureId'];
      const courseId = +params['courseId'];
      this.lectureId.set(lectureId);
      this.courseId.set(courseId);
      
      if (lectureId && courseId) {
        this.loadLecture();
        this.loadComments();
      }
    });
  }

  loadLecture(): void {
    if (!this.lectureId()) return;
    
    this.loading.set(true);
    this.lectureService.getLectureById(this.lectureId()!).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.lecture.set(response.data);
          this.updateTitle.set(response.data.title);
          this.updateDescription.set(response.data.description || '');
          this.organizeFiles(response.data.lectureFiles);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading lecture:', error);
        this.genericService.showError('Failed to load lecture');
        this.loading.set(false);
      }
    });
  }


  organizeFiles(files: LectureFileDTO[]): void {
    const video = files.find(f => f.fileType === 1); // 1 = Video
    const documents = files.filter(f => f.fileType === 2); // 2 = Document
    
    this.videoFile.set(video || null);
    this.documentFiles.set(documents);
  }

  loadComments(): void {
    if (!this.lectureId()) return;
    
    this.commentService.getCommentsByLecture(
      this.lectureId()!,
      null,
      this.commentPageIndex(),
      this.commentPageSize()
    ).subscribe({
      next: (response) => {
        console.log('Load comments response:', response);
        if (response.success && response.data) {
          let items: CommentDTO[] = [];
          let totalPages = 0;
          
          // Check if data is array directly (API returns array)
          if (Array.isArray(response.data)) {
            items = response.data;
            totalPages = 1; // If array, assume single page
            console.log('Data is array directly, length:', items.length);
          }
          // Check if data is PaginatedResponse object
          else if (response.data && typeof response.data === 'object' && 'items' in response.data) {
            items = (response.data as any).items || [];
            totalPages = (response.data as any).totalPages || 0;
            console.log('Data is PaginatedResponse, items:', items.length, 'totalPages:', totalPages);
          }
          
          console.log('Setting comments:', items);
          this.comments.set([...items]); // Use spread to ensure change detection
          this.commentTotalPages.set(totalPages);
          console.log('Comments after set:', this.comments());
          console.log('Comments count:', this.comments().length);
        } else {
          console.warn('Comments response issue:', response);
          this.comments.set([]);
        }
      },
      error: (error) => {
        console.error('Error loading comments:', error);
        this.genericService.showError('Failed to load comments');
        this.comments.set([]);
      }
    });
  }

  // Update Lecture
  openUpdateModal(): void {
    this.showUpdateModal.set(true);
  }

  closeUpdateModal(): void {
    this.showUpdateModal.set(false);
  }

  updateLecture(): void {
    if (!this.lectureId()) return;
    
    const updateDto: UpdateLectureDto = {
      lectureId: this.lectureId()!,
      title: this.updateTitle() || null,
      description: this.updateDescription() || null
    };
    
    this.loading.set(true);
    this.lectureService.updateLecture(updateDto).subscribe({
      next: (response) => {
        if (response.success) {
          this.genericService.showSuccess('Lecture updated successfully');
          this.closeUpdateModal();
          this.loadLecture();
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error updating lecture:', error);
        this.genericService.showError('Failed to update lecture');
        this.loading.set(false);
      }
    });
  }

  // Delete Lecture
  openDeleteModal(): void {
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
  }

  deleteLecture(): void {
    if (!this.lectureId() || !this.courseId()) return;
    
    this.loading.set(true);
    this.lectureService.deleteLecture(this.lectureId()!).subscribe({
      next: (response) => {
        if (response.success) {
          this.genericService.showSuccess('Lecture deleted successfully');
          this.closeDeleteModal();
          // Navigate back to course dashboard or lecture list
          this.router.navigate(['/instructor/courses', this.courseId(), 'dashboard']);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error deleting lecture:', error);
        this.genericService.showError('Failed to delete lecture');
        this.loading.set(false);
      }
    });
  }

  // Upload Video
  openUploadVideoModal(): void {
    this.showUploadVideoModal.set(true);
    this.uploadVideoFile = null;
  }

  closeUploadVideoModal(): void {
    this.showUploadVideoModal.set(false);
    this.uploadVideoFile = null;
  }

  onVideoFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate video file
      const validTypes = ['.mp4', '.avi', '.mov', '.wmv'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      if (!validTypes.includes(fileExtension)) {
        this.genericService.showError('Please select a valid video file (.mp4, .avi, .mov, .wmv)');
        return;
      }
      this.uploadVideoFile = file;
    }
  }

  uploadVideo(): void {
    if (!this.uploadVideoFile || !this.lectureId()) return;
    
    this.uploadingVideo.set(true);
    
    // Upload to storage first
    const prefix = `lectures/${this.lectureId()}/video`;
    this.storageService.uploadFile(this.uploadVideoFile, prefix).subscribe({
      next: (uploadResponse) => {
        if (uploadResponse.success) {
          const fileNameParts = this.uploadVideoFile!.name.split('.');
          const fileExtension = '.' + (fileNameParts.pop() || '').toLowerCase();
          
          // If video already exists, update it; otherwise create new
          const existingVideo = this.videoFile();
          if (existingVideo) {
            // Update existing video file
            this.lectureService.updateLectureFile(
              existingVideo.fileId,
              this.uploadVideoFile!.name,
              uploadResponse.publicUrl
            ).subscribe({
              next: (response) => {
                if (response.success) {
                  this.genericService.showSuccess('Video updated successfully');
                  this.closeUploadVideoModal();
                  this.loadLecture();
                }
                this.uploadingVideo.set(false);
              },
              error: (error) => {
                console.error('Error updating video:', error);
                this.genericService.showError('Failed to update video');
                this.uploadingVideo.set(false);
              }
            });
          } else {
            // Create new video file
            const createFileDto: CreateLectureFileDto = {
              lectureId: this.lectureId()!,
              fileName: this.uploadVideoFile!.name,
              fileType: 1, // Video
              filePath: uploadResponse.publicUrl,
              fileExtension: fileExtension
            };
            
            this.lectureService.createLectureFile(createFileDto).subscribe({
              next: (response) => {
                if (response.success) {
                  this.genericService.showSuccess('Video uploaded successfully');
                  this.closeUploadVideoModal();
                  this.loadLecture();
                }
                this.uploadingVideo.set(false);
              },
              error: (error) => {
                console.error('Error creating video file:', error);
                this.genericService.showError('Failed to upload video');
                this.uploadingVideo.set(false);
              }
            });
          }
        } else {
          console.error('Upload response not successful:', uploadResponse);
          this.genericService.showError('File upload failed');
          this.uploadingVideo.set(false);
        }
      },
      error: (error) => {
        console.error('Error uploading file to storage:', error);
        this.genericService.showError('Failed to upload file');
        this.uploadingVideo.set(false);
      }
    });
  }

  deleteVideo(): void {
    const video = this.videoFile();
    if (!video) return;
    
    if (confirm('Are you sure you want to delete this video?')) {
      this.loading.set(true);
      this.lectureService.deleteLectureFile(video.fileId).subscribe({
        next: (response) => {
          if (response.success) {
            this.genericService.showSuccess('Video deleted successfully');
            this.loadLecture();
          }
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error deleting video:', error);
          this.genericService.showError('Failed to delete video');
          this.loading.set(false);
        }
      });
    }
  }

  // Upload Documents
  openUploadDocumentModal(): void {
    this.showUploadDocumentModal.set(true);
    this.uploadDocumentFiles = [];
  }

  closeUploadDocumentModal(): void {
    this.showUploadDocumentModal.set(false);
    this.uploadDocumentFiles = [];
  }

  onDocumentFilesSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    const validTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xlsx'];
    
    const validFiles = files.filter(file => {
      const fileNameParts = file.name.split('.');
      const fileExtension = '.' + (fileNameParts.pop() || '').toLowerCase();
      return validTypes.includes(fileExtension);
    });
    
    if (validFiles.length !== files.length) {
      this.genericService.showWarning('Some files were skipped. Only PDF, DOC, DOCX, PPT, PPTX, XLSX files are allowed.');
    }
    
    this.uploadDocumentFiles = validFiles;
  }

  uploadDocuments(): void {
    if (this.uploadDocumentFiles.length === 0 || !this.lectureId()) return;
    
    this.uploadingDocuments.set(true);
    let uploadCount = 0;
    let errorCount = 0;
    
    this.uploadDocumentFiles.forEach((file) => {
      const prefix = `lectures/${this.lectureId()}/documents`;
      this.storageService.uploadFile(file, prefix).subscribe({
        next: (uploadResponse) => {
          if (uploadResponse.success) {
            const fileNameParts = file.name.split('.');
            const fileExtension = '.' + (fileNameParts.pop() || '').toLowerCase();
            
            const createFileDto: CreateLectureFileDto = {
              lectureId: this.lectureId()!,
              fileName: file.name,
              fileType: 2, // Document
              filePath: uploadResponse.publicUrl,
              fileExtension: fileExtension
            };
            
            this.lectureService.createLectureFile(createFileDto).subscribe({
              next: (response) => {
                uploadCount++;
                if (uploadCount + errorCount === this.uploadDocumentFiles.length) {
                  if (errorCount === 0) {
                    this.genericService.showSuccess(`${uploadCount} document(s) uploaded successfully`);
                  } else {
                    this.genericService.showWarning(`${uploadCount} uploaded, ${errorCount} failed`);
                  }
                  this.closeUploadDocumentModal();
                  this.loadLecture();
                  this.uploadingDocuments.set(false);
                }
              },
              error: (error) => {
                console.error('Error creating document file:', error);
                errorCount++;
                if (uploadCount + errorCount === this.uploadDocumentFiles.length) {
                  this.genericService.showWarning(`${uploadCount} uploaded, ${errorCount} failed`);
                  this.closeUploadDocumentModal();
                  this.loadLecture();
                  this.uploadingDocuments.set(false);
                }
              }
            });
          } else {
            console.error('Upload response not successful:', uploadResponse);
            errorCount++;
            if (uploadCount + errorCount === this.uploadDocumentFiles.length) {
              this.genericService.showWarning(`${uploadCount} uploaded, ${errorCount} failed`);
              this.closeUploadDocumentModal();
              this.loadLecture();
              this.uploadingDocuments.set(false);
            }
          }
        },
        error: (error) => {
          console.error('Error uploading file to storage:', error);
          errorCount++;
          if (uploadCount + errorCount === this.uploadDocumentFiles.length) {
            this.genericService.showWarning(`${uploadCount} uploaded, ${errorCount} failed`);
            this.closeUploadDocumentModal();
            this.loadLecture();
            this.uploadingDocuments.set(false);
          }
        }
      });
    });
  }

  deleteDocument(fileId: number): void {
    if (confirm('Are you sure you want to delete this document?')) {
      this.loading.set(true);
      this.lectureService.deleteLectureFile(fileId).subscribe({
        next: (response) => {
          if (response.success) {
            this.genericService.showSuccess('Document deleted successfully');
            this.loadLecture();
          }
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error deleting document:', error);
          this.genericService.showError('Failed to delete document');
          this.loading.set(false);
        }
      });
    }
  }

  // Comments
  onCommentFileSelected(event: any): void {
    this.commentFile = event.target.files[0];
  }

  triggerCommentFileInput(): void {
    const fileInput = document.getElementById('commentFileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  submitComment(): void {
    if (!this.lectureId() || (!this.newCommentContent().trim() && !this.commentFile)) {
      this.genericService.showWarning('Please enter a comment or attach a file');
      return;
    }
    
    this.uploadingComment.set(true);
    
    const createComment = (filePath: string | null = null, fileName: string | null = null) => {
      const commentDto: CreateCommentDto = {
        lectureId: this.lectureId()!,
        content: this.newCommentContent().trim() || '',
        parentCmtId: null,
        file: filePath ? { fileName, filePath } : null
      };
      
      console.log('Creating comment with DTO:', commentDto);
      
      this.commentService.createComment(commentDto).subscribe({
        next: (response) => {
          console.log('Create comment response:', response);
          if (response.success) {
            this.genericService.showSuccess('Comment posted successfully');
            this.newCommentContent.set('');
            this.commentFile = null;
            // Reset file input
            const fileInput = document.getElementById('commentFileInput') as HTMLInputElement;
            if (fileInput) {
              fileInput.value = '';
            }
            // Reload comments after a short delay to ensure backend has processed
            setTimeout(() => {
              this.loadComments();
            }, 500);
          } else {
            console.error('Comment creation failed:', response);
            this.genericService.showError(response.message || 'Failed to post comment');
          }
          this.uploadingComment.set(false);
        },
        error: (error) => {
          console.error('Error posting comment:', error);
          console.error('Error details:', error);
          if (error.error) {
            console.error('Error body:', error.error);
          }
          this.genericService.showError(error.error?.message || 'Failed to post comment');
          this.uploadingComment.set(false);
        }
      });
    };
    
    if (this.commentFile) {
      // Upload comment file first
      const prefix = `comments/${this.lectureId()}`;
      console.log('Uploading comment file:', this.commentFile.name, 'to prefix:', prefix);
      
      this.storageService.uploadFile(this.commentFile, prefix).subscribe({
        next: (uploadResponse) => {
          console.log('Upload file response:', uploadResponse);
          if (uploadResponse.success) {
            console.log('Upload successful, creating comment with file:', {
              objectName: uploadResponse.objectName,
              fileName: uploadResponse.fileName
            });
            createComment(uploadResponse.publicUrl, uploadResponse.fileName);
          } else {
            console.error('Upload response not successful:', uploadResponse);
            this.genericService.showError('File upload failed. Please try again.');
            this.uploadingComment.set(false);
          }
        },
        error: (error) => {
          console.error('Error uploading comment file:', error);
          if (error.error) {
            console.error('Upload error body:', error.error);
          }
          this.genericService.showError(error.error?.message || 'Failed to upload comment file');
          this.uploadingComment.set(false);
        }
      });
    } else {
      // No file, create comment directly
      createComment();
    }
  }

  getFileIconClass(extension: string): string {
    const ext = extension.toLowerCase();
    if (ext === '.pdf') return 'fas fa-file-pdf text-danger';
    if (ext === '.pptx' || ext === '.ppt') return 'fas fa-file-powerpoint text-warning';
    if (ext === '.docx' || ext === '.doc') return 'fas fa-file-word text-primary';
    if (ext === '.xlsx' || ext === '.xls') return 'fas fa-file-excel text-success';
    return 'fas fa-file text-secondary';
  }

  getVideoUrl(filePath: string): string {
    // Return signed URL or public URL for video
    // For now, return the filePath. In production, you might need to get signed URL
    return filePath;
  }

  getFileDownloadUrl(filePath: string): string {
    // Return signed URL or public URL for download
    // For now, return the filePath. In production, you might need to get signed URL
    return filePath;
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

