import { Component, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GenericServices } from '../../../../core/services/GenericServices';
import { SharedModule } from '../../../../core/shared/sharedModule';
import { LectureDTO, LectureFileDto } from '../../models/lecture';
import { ApiResponse, PaginatedResponse } from '../../../../core/models/generic-response-class';
import { CommentDto } from '../../models/comment';
import { StudentService } from '../../services/student-service';

@Component({
  selector: 'app-lecture-detail',
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './lecture-detail.html',
  styleUrl: './lecture-detail.scss'
})
export class LectureDetail implements OnInit, OnDestroy {
  lecture = signal<LectureDTO | null>(null);
  allLectures = signal<LectureDTO[]>([]);
  currentLectureIndex = signal<number>(-1);
  loading = signal<boolean>(false);
  markingCompleted = signal<boolean>(false);
  isCompleted = signal<boolean>(false);
  showReportModal = signal<boolean>(false);
  studentCourseID: number | undefined;
  courseID: number | undefined;
  comments = signal<CommentDto[]>([]);
  loadingComments = signal<boolean>(false);
  commentsPageIndex = signal<number>(1);
  commentsPageSize = signal<number>(20);
  commentsHasNextPage = signal<boolean>(false);
  
  // Computed signal for top-level comments
  topLevelComments = signal<CommentDto[]>([]);
  
  // Comment form properties
  commentContent = signal<string>('');
  selectedFile = signal<File | null>(null);
  selectedFileName = signal<string>('');
  submittingComment = signal<boolean>(false);
  parentCommentId = signal<number | null>(null); // For replying to a comment
  
  // Track which comments have loaded replies
  loadedReplies = signal<Set<number>>(new Set());
  expandedReplies = signal<Set<number>>(new Set()); // Track expanded replies sections
  replyCounts = signal<Map<number, number>>(new Map()); // Store reply counts for each comment
  
  // Current user
  currentUser = signal<any>(null);
  
  // Edit comment state
  editingCommentId = signal<number | null>(null);
  editContent = signal<string>('');
  updatingComment = signal<boolean>(false);
  deletingComment = signal<number | null>(null);
  openDropdownId = signal<number | null>(null); // Track which dropdown is open
  
  // Lecture files (video + documents) - giống instructor
  videoFile = signal<LectureFileDto | null>(null);
  documentFiles = signal<LectureFileDto[]>([]);
  
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private genericService = inject(GenericServices);
  private studentService = inject(StudentService);
  private subscriptions = new Subscription();

  ngOnInit(): void {
    // Load current user profile
    this.loadCurrentUser();
    
    // Lấy studentcourseID từ route params (từ course-layout)
    const parentRoute = this.route.parent;
    const studentCourseIDParam = parentRoute?.snapshot.paramMap.get('studentcourseID');
    
    if (studentCourseIDParam) {
      this.studentCourseID = Number(studentCourseIDParam);
      
      if (this.studentCourseID) {
        // Bước 1: Load student course detail để lấy courseID
        this.loadStudentCourseDetail(this.studentCourseID);
      }
    } else {
      console.error('❌ StudentCourseID not found in route params');
      this.genericService.showError('Course not found');
      this.navigateBack();
    }
    
    // Subscribe query params để load lecture khi navigate
    const queryParamsSub = this.route.queryParams.subscribe(params => {
      const lectureId = params['lectureId'];
      if (lectureId) {
        // Nếu đã có courseID, load ngay
        if (this.courseID) {
          // Reset state khi lectureId thay đổi
          const currentLectureId = this.lecture()?.lectureId;
          if (currentLectureId !== Number(lectureId)) {
            // Đang chuyển sang lecture khác, reset state
            this.isCompleted.set(false);
            this.markingCompleted.set(false);
          }
          
          this.loadLectureDetail(Number(lectureId));
          // checkCompletedStatus sẽ được gọi trong loadLectureDetail
          this.loadComments(Number(lectureId));
        }
        // Nếu chưa có courseID, sẽ được load trong loadStudentCourseDetail callback
      } else {
        this.genericService.showError('Lecture ID is required');
        this.navigateBack();
      }
    });

    this.subscriptions.add(queryParamsSub);
  }

  /**
   * Load student course detail để lấy courseID
   * Sau đó dùng courseID để load lectures
   */
  loadStudentCourseDetail(studentCourseID: number): void {
    const studentcourseSub = this.studentService
      .getStudentCourseDetailById('api/student-courses', studentCourseID)
      .subscribe({
        next: (res: any) => {
          if (res.success && res.data) {
            // Lấy courseID từ API response
            const courseId = res.data?.courseId || res.data?.course?.courseId;
            
            if (courseId) {
              this.courseID = courseId;
              console.log('✅ Course ID loaded:', this.courseID);
              
              // Bước 2: Load all lectures sau khi đã có courseID
              this.loadAllLectures();
              
              // Load lecture detail nếu có lectureId trong query params
              const lectureId = this.route.snapshot.queryParams['lectureId'];
              if (lectureId) {
                // Reset state khi load lecture
                this.isCompleted.set(false);
                this.markingCompleted.set(false);
                
                this.loadLectureDetail(Number(lectureId));
                // checkCompletedStatus sẽ được gọi trong loadLectureDetail
                this.loadComments(Number(lectureId));
              }
            } else {
              console.warn('⚠️ CourseID not found in response');
            }
          }
        },
        error: (err) => {
          console.error('❌ Failed to load student course detail:', err);
          this.genericService.showError('Failed to load course information');
          this.navigateBack();
        }
      });

    this.subscriptions.add(studentcourseSub);
  }

  loadAllLectures(): void {
    if (!this.courseID) {
      console.warn('⚠️ CourseID not available, cannot load lectures');
      return;
    }
    
    const courseIdValue = Number(this.courseID);
    const filters = {
      courseId: courseIdValue,  // Sử dụng courseId (chữ thường) thay vì CourseId
      pageIndex: 1,
      pageSize: 100
    };

    const lecturesSub = this.genericService.getWithFilter('/api/lectures/course', filters).subscribe({
      next: (res: ApiResponse<LectureDTO[]> | ApiResponse<PaginatedResponse<LectureDTO>>) => {
        if (res.success) {
          let lectureList: LectureDTO[] = [];
          
          if ('items' in (res.data as any)) {
            const paginatedData = res.data as PaginatedResponse<LectureDTO>;
            lectureList = paginatedData.items || [];
          } else {
            lectureList = (res.data as LectureDTO[]) || [];
          }
          
          this.allLectures.set(lectureList);
          console.log('✅ Lectures loaded:', lectureList.length);
          
          // Find current lecture index after lectures are loaded
          const currentLecture = this.lecture();
          if (currentLecture?.lectureId) {
            const index = lectureList.findIndex(l => l.lectureId === currentLecture.lectureId);
            if (index !== -1) {
              this.currentLectureIndex.set(index);
              console.log('✅ Current lecture index:', index);
            }
          }
        }
      },
      error: (err) => {
        console.error('❌ Error loading lectures:', err);
        this.allLectures.set([]);
      }
    });

    this.subscriptions.add(lecturesSub);
  }

  loadLectureDetail(lectureId: number): void {
    // Reset completion state khi load lecture mới
    this.isCompleted.set(false);
    this.markingCompleted.set(false);
    this.loading.set(true);
    const lectureSub = this.genericService.get<ApiResponse<LectureDTO>>(`api/lectures/${lectureId}`).subscribe({
      next: (res: ApiResponse<LectureDTO>) => {
        if (res.success && res.data) {
          this.lecture.set(res.data);
          
          
          if (res.data?.lectureFiles && res.data.lectureFiles.length > 0) {
            res.data.lectureFiles.forEach((f, idx) => {
              console.log(`  File ${idx}:`, {
                name: f.fileName,
                type: f.fileType,
                ext: f.fileExtension,
                path: f.filePath,
                isVideo: this.isVideoFile(f)
              });
            });
          }
          
          // Tổ chức file giống instructor: tách video và documents
          this.organizeFiles(res.data.lectureFiles || []);
          
          console.log("🎥 Video file:", this.videoFile());
          console.log("📄 Document files:", this.documentFiles());
          
          // Check completion status sau khi lecture đã được load
          this.checkCompletedStatus(lectureId);
          
          // Update current lecture index after a short delay to ensure allLectures is loaded
          setTimeout(() => {
            const allLectures = this.allLectures();
            const index = allLectures.findIndex(l => l.lectureId === res.data?.lectureId);
            if (index !== -1) {
              this.currentLectureIndex.set(index);
              console.log('✅ Current lecture index updated:', index);
            } else if (allLectures.length === 0 && this.courseID) {
              // Reload lectures if not loaded yet
              this.loadAllLectures();
            }
          }, 100);
        } else {
          this.genericService.showError('Failed to load lecture');
          this.navigateBack();
        }
      },
      error: (err) => {
        console.error('Error loading lecture detail:', err);
        this.genericService.showError('Failed to load lecture. Please try again.');
        this.navigateBack();
      },
      complete: () => {
        this.loading.set(false);
      }
    });

    this.subscriptions.add(lectureSub);
  }

  checkCompletedStatus(lectureId: number): void {
    // Load completed lectures for this course
    if (!this.courseID) {
      console.warn('⚠️ CourseID not available, cannot check completion status');
      return;
    }
    
    const courseIdValue = Number(this.courseID);
    const completedSub = this.genericService.getWithFilter('/api/lectures/course/completed', {
      courseId: courseIdValue
    }).subscribe({
      next: (res: ApiResponse<any[]>) => {
        if (res.success && res.data) {
          const completedLectures = res.data as any[];
          const isCompleted = completedLectures.some(c => c.lectureId === lectureId);
          this.isCompleted.set(isCompleted);
        }
      },
      error: (err) => {
        console.error('Error checking completion status:', err);
      }
    });

    this.subscriptions.add(completedSub);
  }

  /**
   * Tổ chức file giống instructor: 1 video + list documents
   * API trả về: fileType = 1 (video), fileType = 2 (document)
   */
  organizeFiles(files: LectureFileDto[]): void {
    if (!files || files.length === 0) {
      this.videoFile.set(null);
      this.documentFiles.set([]);
      return;
    }

    let video: LectureFileDto | null = null;
    const documents: LectureFileDto[] = [];

    files.forEach(f => {
      // Prioritize API fileType field
      if (f.fileType === 1) {
        // Video file - chỉ lấy cái đầu tiên
        if (!video) {
          video = f;
        }
      } else if (f.fileType === 2) {
        // Document file
        documents.push(f);
      } else {
        // Fallback: nếu fileType không rõ, check bằng extension
        if (this.isVideoFile(f)) {
          if (!video) {
            video = f;
          }
        } else {
          documents.push(f);
        }
      }
    });

    this.videoFile.set(video);
    this.documentFiles.set(documents);
    
    console.log(`✅ Organized files: ${video ? '1 video' : 'no video'}, ${documents.length} documents`);
  }

  /**
   * Check xem file có phải video không (fallback khi fileType không rõ)
   */
  isVideoFile(file: LectureFileDto): boolean {
    const videoExtensions = ['mp4', 'mov', 'avi', 'webm', 'mkv', 'flv', 'wmv'];
    
    // Check fileType number (1 = video)
    if (file.fileType === 1) {
      return true;
    }
    
    // Check extension
    if (file.fileExtension) {
      const ext = file.fileExtension.toLowerCase().replace(/^\./, '');
      if (videoExtensions.includes(ext)) {
        return true;
      }
    }
    
    // Check fileName
    if (file.fileName) {
      const ext = file.fileName.toLowerCase().split('.').pop() || '';
      if (videoExtensions.includes(ext)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Các helper giống instructor – sau này dễ chuyển sang signed URL
   */
  getVideoUrl(filePath: string): string {
    return filePath;
  }

  getFileDownloadUrl(filePath: string): string {
    return filePath;
  }

  getMimeType(ext: string | null): string {
    if (!ext) return 'video/mp4';
    
    ext = ext.replace('.', '').toLowerCase();

    const map: any = {
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      webm: 'video/webm',
      avi: 'video/x-msvideo',
      mkv: 'video/x-matroska',
      flv: 'video/x-flv',
      wmv: 'video/x-ms-wmv'
    };

    return map[ext] || 'video/mp4';
  }

  markAsCompleted(): void {
    const lecture = this.lecture();
    if (!lecture?.lectureId) return;
    
    if (this.isCompleted()) {
      // Unmark as completed
      this.unmarkAsCompleted();
      return;
    }
    
    this.markingCompleted.set(true);
    const completeSub = this.genericService.post<ApiResponse<any>>(`api/lectures/completed/${lecture.lectureId}`, {}).subscribe({
      next: (res: ApiResponse<any>) => {
        if (res.success) {
          this.isCompleted.set(true);
          this.genericService.showSuccess('Lecture marked as completed!');
        } else {
          this.genericService.showError(res.message || 'Failed to mark lecture as completed');
        }
      },
      error: (err) => {
        console.error('Error marking lecture as completed:', err);
        this.genericService.showError('Failed to mark lecture as completed. Please try again.');
      },
      complete: () => {
        this.markingCompleted.set(false);
      }
    });

    this.subscriptions.add(completeSub);
  }

  unmarkAsCompleted(): void {
    const lecture = this.lecture();
    if (!lecture?.lectureId) return;
    
    this.markingCompleted.set(true);
    const unmarkSub = this.genericService.delete<ApiResponse<any>>(`api/lectures/completed/${lecture.lectureId}`).subscribe({
      next: (res: ApiResponse<any>) => {
        if (res.success) {
          this.isCompleted.set(false);
          this.genericService.showSuccess('Lecture unmarked');
        } else {
          this.genericService.showError(res.message || 'Failed to unmark lecture');
        }
      },
      error: (err) => {
        console.error('Error unmarking lecture:', err);
        this.genericService.showError('Failed to unmark lecture. Please try again.');
      },
      complete: () => {
        this.markingCompleted.set(false);
      }
    });

    this.subscriptions.add(unmarkSub);
  }

  goToPreviousLecture(): void {
    const allLectures = this.allLectures();
    const currentIndex = this.currentLectureIndex();
    
    if (currentIndex > 0 && allLectures.length > 0) {
      const previousLecture = allLectures[currentIndex - 1];
      if (previousLecture?.lectureId) {
        this.navigateToLecture(previousLecture.lectureId);
      }
    } else {
      console.warn('⚠️ No previous lecture available');
    }
  }

  goToNextLecture(): void {
    const allLectures = this.allLectures();
    const currentIndex = this.currentLectureIndex();
    
    if (currentIndex >= 0 && currentIndex < allLectures.length - 1) {
      const nextLecture = allLectures[currentIndex + 1];
      if (nextLecture?.lectureId) {
        this.navigateToLecture(nextLecture.lectureId);
      }
    } else {
      console.warn('⚠️ No next lecture available');
    }
  }

  navigateToLecture(lectureId: number): void {
    if (!lectureId || !this.studentCourseID) {
      console.error('❌ Cannot navigate: lectureId or studentCourseID is missing');
      return;
    }
    
    // Reset completion state trước khi navigate sang lecture mới
    const currentLectureId = this.lecture()?.lectureId;
    if (currentLectureId !== lectureId) {
      this.isCompleted.set(false);
      this.markingCompleted.set(false);
      // Clear lecture data để tránh hiển thị lecture cũ
      this.lecture.set(null);
      this.videoFile.set(null);
      this.documentFiles.set([]);
    }
    
    // Navigate với studentCourseID từ route params
    this.router.navigate(['/student/course', this.studentCourseID, 'lecture-detail'], { 
      queryParams: { lectureId } 
    });
  }

  hasPreviousLecture(): boolean {
    const currentIndex = this.currentLectureIndex();
    return currentIndex > 0;
  }

  hasNextLecture(): boolean {
    const allLectures = this.allLectures();
    const currentIndex = this.currentLectureIndex();
    return currentIndex >= 0 && currentIndex < allLectures.length - 1;
  }

  openReportModal(): void {
    this.showReportModal.set(true);
  }

  closeReportModal(): void {
    this.showReportModal.set(false);
  }

  navigateBack(): void {
    if (this.studentCourseID) {
      // Navigate về course-info với studentCourseID
      this.router.navigate(['/student/course', this.studentCourseID]);
    } else {
      this.router.navigate(['/student/my-courses']);
    }
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(date: string | Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    // Less than 1 minute ago
    if (diffMins < 1) return 'now';
    
    // Less than 1 hour ago
    if (diffMins < 60) return `${diffMins}m`;
    
    // Less than 24 hours ago
    if (diffHours < 24) return `${diffHours}h`;
    
    // Less than 7 days ago
    if (diffDays < 7) return `${diffDays}d`;
    
    // Same year - show month and day
    if (d.getFullYear() === now.getFullYear()) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    // Different year - show short date
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
  }

  loadComments(lectureId: number, parentCmtId?: number | null, pageIndex?: number): void {
    this.loadingComments.set(true);
    
    // If pageIndex is provided, use it; otherwise reset to 1 for replies or use current for top-level
    const currentPageIndex = pageIndex ?? (parentCmtId ? 1 : this.commentsPageIndex());

    const filters: any = {
      LectureId: lectureId,
      PageIndex: currentPageIndex,
      PageSize: this.commentsPageSize()
    };

    if (parentCmtId !== undefined && parentCmtId !== null) {
      filters.ParentCmtId = parentCmtId;
    }

    console.log('Loading comments with filters:', filters);

    const commentsSub = this.genericService.getWithFilter('/api/comments', filters).subscribe({
      next: (res: any) => {
        console.log('Comments API response:', res);
        
        if (res.success && res.data) {
          let commentsList: CommentDto[] = [];
          
          // Check if response is paginated or direct array
          if (Array.isArray(res.data)) {
            // Direct array response
            commentsList = res.data as CommentDto[];
            console.log('Comments as array:', commentsList);
            // For direct array, assume no more pages if we got less than pageSize
            if (commentsList.length < this.commentsPageSize()) {
              this.commentsHasNextPage.set(false);
            }
          } else if (res.data && 'items' in res.data) {
            // Paginated response
            const paginatedData = res.data as PaginatedResponse<CommentDto>;
            commentsList = paginatedData.items || [];
            console.log('Paginated data:', paginatedData);
            this.commentsHasNextPage.set(paginatedData.hasNextPage || false);
          } else {
            console.warn('Unknown response format:', res.data);
            commentsList = [];
          }
          
          console.log('Comments items to process:', commentsList);
          
          if (parentCmtId) {
            // If loading replies, append to existing comments (avoid duplicates)
            this.comments.update(prev => {
              const existingIds = new Set(prev.map(c => c.commentId));
              const newReplies = commentsList.filter(c => !existingIds.has(c.commentId));
              const updated = [...prev, ...newReplies];
              console.log('Updated comments with replies:', updated);
              // Mark this parent comment as having loaded replies
              this.loadedReplies.update(loaded => new Set([...loaded, parentCmtId]));
              // Update reply count with actual loaded count
              const actualCount = commentsList.length;
              this.replyCounts.update(counts => {
                const newMap = new Map(counts);
                // Update with actual count (may be more accurate than initial estimate)
                if (!newMap.has(parentCmtId) || newMap.get(parentCmtId)! < actualCount) {
                  newMap.set(parentCmtId, actualCount);
                }
                return newMap;
              });
              return updated;
            });
          } else {
            // If loading top-level comments, append or replace based on page
            if (currentPageIndex === 1) {
              console.log('Setting comments (page 1):', commentsList);
              this.comments.set(commentsList);
              this.commentsPageIndex.set(1);
              
              // Load reply counts for all top-level comments
              this.loadReplyCountsForComments(commentsList);
            } else {
              this.comments.update(prev => {
                const updated = [...prev, ...commentsList];
                console.log('Appending comments (page > 1):', updated);
                return updated;
              });
              this.commentsPageIndex.set(currentPageIndex);
              // Load reply counts for new comments
              this.loadReplyCountsForComments(commentsList);
            }
            // Update top-level comments after setting all comments
            this.updateTopLevelComments();
          }
          console.log('Total comments after load:', this.comments().length);
          console.log('Top-level comments:', this.topLevelComments().length);
        } else {
          console.warn('API response not successful or no data:', res);
          if (!parentCmtId && currentPageIndex === 1) {
            // Reset comments if first load failed
            this.comments.set([]);
            this.topLevelComments.set([]);
          }
        }
      },
      error: (err) => {
        console.error('Error loading comments:', err);
        this.genericService.showError('Failed to load comments');
        if (!parentCmtId) {
          this.comments.set([]);
          this.topLevelComments.set([]);
        }
      },
      complete: () => {
        this.loadingComments.set(false);
        console.log('Loading comments complete');
      }
    });

    this.subscriptions.add(commentsSub);
  }

  loadRepliesForComment(parentCmtId: number): void {
    const lecture = this.lecture();
    if (!lecture?.lectureId) return;
    
    // Check if replies are already loaded
    const hasLoaded = this.loadedReplies().has(parentCmtId);
    const existingReplies = this.getRepliesForComment(parentCmtId);
    
    // If already loaded, just toggle expand/collapse
    if (hasLoaded) {
      this.toggleReplies(parentCmtId);
      return;
    }
    
    // Load replies if not loaded yet
    if (!hasLoaded) {
      // Expand first to show loading state
      this.expandedReplies.update(expanded => new Set([...expanded, parentCmtId]));
      // Then load replies
      this.loadComments(lecture.lectureId, parentCmtId, 1);
    }
  }

  toggleReplies(commentId: number): void {
    this.expandedReplies.update(expanded => {
      const newSet = new Set(expanded);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  }

  isRepliesExpanded(commentId: number): boolean {
    return this.expandedReplies().has(commentId);
  }

  getReplyCount(commentId: number): number {
    // First check if we have loaded replies
    const loadedReplies = this.getRepliesForComment(commentId);
    if (loadedReplies.length > 0) {
      return loadedReplies.length;
    }
    
    // If not loaded, check stored reply count
    const storedCount = this.replyCounts().get(commentId);
    if (storedCount !== undefined) {
      return storedCount;
    }
    
    return 0;
  }

  loadReplyCountsForComments(comments: CommentDto[]): void {
    const lecture = this.lecture();
    if (!lecture?.lectureId) return;
    
    // Load reply counts for each comment
    comments.forEach(comment => {
      // Only load if not already loaded
      if (!this.loadedReplies().has(comment.commentId) && !this.replyCounts().has(comment.commentId)) {
        // Load with large pageSize to get all replies for counting
        const countSub = this.genericService.getWithFilter('/api/comments', {
          LectureId: lecture.lectureId,
          ParentCmtId: comment.commentId,
          PageIndex: 1,
          PageSize: 100 // Load up to 100 replies to count accurately
        }).subscribe({
          next: (res: any) => {
            if (res.success && res.data) {
              let totalCount = 0;
              
              if (Array.isArray(res.data)) {
                // Direct array - count items
                totalCount = res.data.length;
              } else if (res.data && 'totalCount' in res.data) {
                // Paginated response with totalCount
                totalCount = (res.data as PaginatedResponse<CommentDto>).totalCount || 0;
              } else if (res.data && 'items' in res.data) {
                // Paginated response
                const paginatedData = res.data as PaginatedResponse<CommentDto>;
                // Use totalCount if available, otherwise use items length
                totalCount = paginatedData.totalCount || paginatedData.items?.length || 0;
              }
              
              if (totalCount > 0) {
                this.replyCounts.update(counts => {
                  const newMap = new Map(counts);
                  newMap.set(comment.commentId, totalCount);
                  return newMap;
                });
                console.log(`Reply count for comment ${comment.commentId}: ${totalCount}`);
              }
            }
          },
          error: (err) => {
            console.error('Error loading reply count:', err);
          }
        });
        
        this.subscriptions.add(countSub);
      }
    });
  }

  // Recursive method to get all nested replies count
  getTotalReplyCount(commentId: number): number {
    const directReplies = this.getRepliesForComment(commentId);
    let total = directReplies.length;
    
    // Recursively count nested replies
    for (const reply of directReplies) {
      total += this.getTotalReplyCount(reply.commentId);
    }
    
    return total;
  }

  // Check if a comment has any replies (including nested)
  hasAnyReplies(commentId: number): boolean {
    return this.getReplyCount(commentId) > 0;
  }

  loadMoreComments(): void {
    const lecture = this.lecture();
    if (!lecture?.lectureId || !this.commentsHasNextPage() || this.loadingComments()) return;

    const nextPage = this.commentsPageIndex() + 1;
    this.loadComments(lecture.lectureId, undefined, nextPage);
  }

  updateTopLevelComments(): void {
    const allComments = this.comments();
    const topLevel = allComments.filter(c => !c.parentCmtId || c.parentCmtId === null || c.parentCmtId === undefined);
    this.topLevelComments.set(topLevel);
    console.log('updateTopLevelComments - All:', allComments.length, 'Top-level:', topLevel.length);
  }

  getTopLevelComments(): CommentDto[] {
    return this.topLevelComments();
  }

  getRepliesForComment(parentCmtId: number): CommentDto[] {
    return this.comments().filter(c => c.parentCmtId === parentCmtId);
  }

  hasReplies(commentId: number): boolean {
    return this.comments().some(c => c.parentCmtId === commentId);
  }

  getUserDisplayName(user: CommentDto['user']): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.firstName || user.lastName || 'Anonymous';
  }

  getInitials(user: CommentDto['user']): string {
    const firstName = user.firstName?.charAt(0) || '';
    const lastName = user.lastName?.charAt(0) || '';
    return (firstName + lastName).toUpperCase() || 'U';
  }

  hasValidFile(comment: CommentDto): boolean {
    if (!comment.file) return false;
    
    const filePath = comment.file.filePath;
    if (!filePath || typeof filePath !== 'string') return false;
    
    const trimmed = filePath.trim();
    return trimmed.length > 0 && 
           trimmed.toLowerCase() !== 'string' &&
           (trimmed.startsWith('http') || trimmed.startsWith('/'));
  }

  isValidFilePath(filePath: string | undefined): boolean {
    if (!filePath || typeof filePath !== 'string') return false;
    
    const trimmed = filePath.trim();
    return trimmed.length > 0 && 
           trimmed.toLowerCase() !== 'string' &&
           (trimmed.startsWith('http') || trimmed.startsWith('/'));
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile.set(file);
      this.selectedFileName.set(file.name);
      console.log('File selected:', file.name);
    }
  }

  removeSelectedFile(): void {
    this.selectedFile.set(null);
    this.selectedFileName.set('');
    // Reset file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async uploadFile(): Promise<{ fileName: string; filePath: string } | null> {
    const file = this.selectedFile();
    if (!file) return null;

    const formData = new FormData();
    formData.append('File', file);
    formData.append('Prefix', 'public/comments');

    return new Promise((resolve, reject) => {
      const upload = this.genericService.post('api/storage/upload', formData).subscribe({
        next: (res: any) => {
          console.log('📤 Upload success:', res);
          if (res?.publicUrl) {
            resolve({
              fileName: file.name,
              filePath: res.publicUrl
            });
          } else {
            reject('No URL returned');
          }
        },
        error: (err) => {
          console.error('❌ Upload failed:', err);
          this.genericService.showError('Failed to upload file. Please try again.');
          reject(err);
        }
      });
      this.subscriptions.add(upload);
    });
  }

  async submitComment(): Promise<void> {
    const lecture = this.lecture();
    if (!lecture?.lectureId) {
      this.genericService.showError('Lecture not found');
      return;
    }

    const content = this.commentContent().trim();
    if (!content) {
      this.genericService.showError('Please enter a comment');
      return;
    }

    this.submittingComment.set(true);

    try {
      let fileData: { fileName: string; filePath: string } | null = null;

      // Upload file if selected
      if (this.selectedFile()) {
        fileData = await this.uploadFile();
        if (!fileData) {
          // Upload failed, but continue without file
          this.submittingComment.set(false);
          return;
        }
      }

      // Prepare comment request
      const commentRequest: any = {
        lectureId: lecture.lectureId,
        content: content,
        parentCmtId: this.parentCommentId() || null,
        file: fileData ? {
          fileName: fileData.fileName,
          filePath: fileData.filePath
        } : null
      };

      console.log('Submitting comment:', commentRequest);

      // Store parentCommentId before resetting
      const parentId = this.parentCommentId();

      // Create comment
      const createSub = this.genericService.post<ApiResponse<CommentDto>>('api/comments', commentRequest).subscribe({
        next: (res: ApiResponse<CommentDto>) => {
          if (res.success && res.data) {
            this.genericService.showSuccess('Comment posted successfully!');
            
            // Reset form
            this.commentContent.set('');
            this.selectedFile.set(null);
            this.selectedFileName.set('');
            this.parentCommentId.set(null);
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) {
              fileInput.value = '';
            }

            // Reload comments
            // If it was a reply, reload replies of parent comment
            // Otherwise reload top-level comments
            if (parentId) {
              // Reload replies for the parent comment
              this.loadedReplies.update(loaded => {
                const newSet = new Set(loaded);
                newSet.delete(parentId); // Reset loaded state
                return newSet;
              });
              this.comments.update(prev => {
                // Remove old replies of this parent
                return prev.filter(c => c.parentCmtId !== parentId);
              });
              // Update reply count (increment by 1)
              this.replyCounts.update(counts => {
                const newMap = new Map(counts);
                const currentCount = newMap.get(parentId) || 0;
                newMap.set(parentId, currentCount + 1);
                return newMap;
              });
              this.loadComments(lecture.lectureId!, parentId, 1);
              // Expand replies section
              this.expandedReplies.update(expanded => new Set([...expanded, parentId]));
            } else {
              // Reload top-level comments
              this.comments.set([]);
              this.topLevelComments.set([]);
              this.replyCounts.set(new Map()); // Reset reply counts
              this.loadComments(lecture.lectureId!, undefined, 1);
            }
          } else {
            this.genericService.showError(res.message || 'Failed to post comment');
          }
        },
        error: (err) => {
          console.error('Error creating comment:', err);
          this.genericService.showError('Failed to post comment. Please try again.');
        },
        complete: () => {
          this.submittingComment.set(false);
        }
      });

      this.subscriptions.add(createSub);
    } catch (error) {
      console.error('Error submitting comment:', error);
      this.genericService.showError('Failed to post comment. Please try again.');
      this.submittingComment.set(false);
    }
  }

  replyToComment(commentId: number): void {
    this.parentCommentId.set(commentId);
    
    // Load replies if not already loaded and expand
    this.loadRepliesForComment(commentId);
    
    // Scroll to comment input
    const commentInput = document.querySelector('textarea[placeholder="Write your comment"]') as HTMLTextAreaElement;
    if (commentInput) {
      setTimeout(() => {
        commentInput.focus();
        commentInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }

  cancelReply(): void {
    this.parentCommentId.set(null);
  }

  loadCurrentUser(): void {
    const loadUserSub = this.genericService.get('api/profile/me').subscribe({
      next: (data: any) => {
        this.currentUser.set(data);
        console.log('✅ Current user loaded:', this.currentUser());
      },
      error: (err) => {
        console.error('❌ Failed to load current user:', err);
      }
    });
    this.subscriptions.add(loadUserSub);
  }

  isOwnComment(comment: CommentDto): boolean {
    const user = this.currentUser();
    if (!user || !comment.user) return false;
    return user.id === comment.user.id;
  }

  toggleDropdown(commentId: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.openDropdownId.update(current => {
      return current === commentId ? null : commentId;
    });
  }

  closeDropdown(): void {
    this.openDropdownId.set(null);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    // Close dropdown if clicking outside
    if (!target.closest('.dropdown')) {
      this.closeDropdown();
    }
  }

  startEditComment(comment: CommentDto): void {
    this.editingCommentId.set(comment.commentId);
    this.editContent.set(comment.content);
    this.closeDropdown();
  }

  cancelEditComment(): void {
    this.editingCommentId.set(null);
    this.editContent.set('');
  }

  async updateComment(commentId: number): Promise<void> {
    const content = this.editContent().trim();
    if (!content) {
      this.genericService.showError('Please enter a comment');
      return;
    }

    this.updatingComment.set(true);

    try {
      // Keep existing file - don't allow file update
      const existingComment = this.comments().find(c => c.commentId === commentId);
      let fileData: { fileName: string; filePath: string } | null = null;

      if (existingComment?.file && this.hasValidFile(existingComment)) {
        // Keep existing file
        fileData = {
          fileName: existingComment.file.filePath.split('/').pop() || 'file',
          filePath: existingComment.file.filePath
        };
      }

      // Prepare update request
      const updateRequest: any = {
        content: content,
        file: fileData ? {
          fileName: fileData.fileName,
          filePath: fileData.filePath
        } : null
      };

      console.log('Updating comment:', updateRequest);

      const updateSub = this.genericService.put<ApiResponse<CommentDto>>(`api/comments/${commentId}`, updateRequest).subscribe({
        next: (res: ApiResponse<CommentDto>) => {
          if (res.success && res.data) {
            this.genericService.showSuccess('Comment updated successfully!');
            
            // Cancel edit mode
            this.cancelEditComment();

            // Reload comments
            const lecture = this.lecture();
            if (lecture?.lectureId) {
              const comment = this.comments().find(c => c.commentId === commentId);
              if (comment?.parentCmtId) {
                // If it was a reply, reload replies of parent comment
                const parentId = comment.parentCmtId;
                this.loadedReplies.update(loaded => {
                  const newSet = new Set(loaded);
                  newSet.delete(parentId);
                  return newSet;
                });
                this.comments.update(prev => prev.filter(c => c.parentCmtId !== parentId));
                this.loadComments(lecture.lectureId, parentId, 1);
                this.expandedReplies.update(expanded => new Set([...expanded, parentId]));
              } else {
                // Reload top-level comments
                this.comments.set([]);
                this.topLevelComments.set([]);
                this.replyCounts.set(new Map());
                this.loadComments(lecture.lectureId, undefined, 1);
              }
            }
          } else {
            this.genericService.showError(res.message || 'Failed to update comment');
          }
        },
        error: (err) => {
          console.error('Error updating comment:', err);
          this.genericService.showError('Failed to update comment. Please try again.');
        },
        complete: () => {
          this.updatingComment.set(false);
        }
      });

      this.subscriptions.add(updateSub);
    } catch (error) {
      console.error('Error updating comment:', error);
      this.genericService.showError('Failed to update comment. Please try again.');
      this.updatingComment.set(false);
    }
  }

  deleteComment(commentId: number): void {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    this.deletingComment.set(commentId);
    this.closeDropdown();

    const deleteSub = this.genericService.delete<ApiResponse<any>>(`api/comments/${commentId}`).subscribe({
      next: (res: ApiResponse<any>) => {
        if (res.success) {
          this.genericService.showSuccess('Comment deleted successfully!');
          
          // Reload comments
          const lecture = this.lecture();
          if (lecture?.lectureId) {
            const comment = this.comments().find(c => c.commentId === commentId);
            if (comment?.parentCmtId) {
              // If it was a reply, reload replies of parent comment
              const parentId = comment.parentCmtId;
              this.loadedReplies.update(loaded => {
                const newSet = new Set(loaded);
                newSet.delete(parentId);
                return newSet;
              });
              this.comments.update(prev => prev.filter(c => c.parentCmtId !== parentId));
              
              // Update reply count (decrement by 1)
              this.replyCounts.update(counts => {
                const newMap = new Map(counts);
                const currentCount = newMap.get(parentId) || 0;
                if (currentCount > 0) {
                  newMap.set(parentId, currentCount - 1);
                }
                return newMap;
              });
              
              this.loadComments(lecture.lectureId, parentId, 1);
              this.expandedReplies.update(expanded => new Set([...expanded, parentId]));
            } else {
              // Reload top-level comments
              this.comments.set([]);
              this.topLevelComments.set([]);
              this.replyCounts.set(new Map());
              this.loadComments(lecture.lectureId, undefined, 1);
            }
          }
        } else {
          this.genericService.showError(res.message || 'Failed to delete comment');
        }
      },
      error: (err) => {
        console.error('Error deleting comment:', err);
        this.genericService.showError('Failed to delete comment. Please try again.');
      },
      complete: () => {
        this.deletingComment.set(null);
      }
    });

    this.subscriptions.add(deleteSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
