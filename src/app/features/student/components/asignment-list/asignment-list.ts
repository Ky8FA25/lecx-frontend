import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { AssignmentDto } from '../../../../core/models/asignment';
import { AssignmentService } from '../../services/asignment-service';
import { GetAssignmentsByCourseRequest } from '../../models/getAssignmentsByCourseRequest';
import { SharedModule } from '../../../../core/shared/sharedModule';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment.development';
import { map, Observable, forkJoin, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-asignment-list',
  imports: [SharedModule, DatePipe],
  templateUrl: './asignment-list.html',
  styleUrl: './asignment-list.scss'
})
export class AsignmentList implements  OnInit, OnDestroy {
  assignments = signal<AssignmentDto[]>([]);
  submissionsMap = signal<Map<number, { hasSubmission: boolean; submissionLink: string | null }>>(new Map());
  currentDate = new Date();
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private baseUrl = environment.apiBEUrl;
  courseID: string | undefined;
  // Pagination
  currentPage = 1;
  totalPage = 1;
  pages: number[] = [];

   userId  = this.getUserId();
   private toastr = inject(ToastrService);
   private subscriptions = new Subscription();

  constructor(private assignmentService: AssignmentService) { }
  

  ngOnInit(): void {
    const parentRoute = this.route.parent;
    const id = parentRoute?.snapshot.paramMap.get('courseID') ?? undefined;
    this.courseID = id;
    this.loadAssignments();
  }
  isAvailable(item: AssignmentDto): boolean {
    if (!item.dueDate) return false; // nếu không có dueDate => hết hạn
    return new Date(item.dueDate) >= this.currentDate;
  }

  getUserId(): string | null {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));

    return decoded.sub || null;
  }

  loadAssignments() {
    const courseIdValue = Number(this.courseID);
    const req: GetAssignmentsByCourseRequest = {
      searchWord: '',
      courseId: courseIdValue,
      dateSearch: '',
      pageIndex: this.currentPage,
      pageSize: 5
    };
    this.subscriptions.add(this.assignmentService.getAssignmentsByCourse('/api/assignments/filter', req).subscribe({
      next: (res: any) => {
        this.assignments.set(res.data);
        this.totalPage = res.totalPages;
        this.pages = Array.from({ length: this.totalPage }, (_, i) => i + 1);
        // Load submissions for all assignments
        this.loadSubmissionsForAssignments(res.data);
      },
      error: err => console.error('❌ Error loading assignments:', err)
    }));
  }

  loadSubmissionsForAssignments(assignments: AssignmentDto[]) {
    const submissionRequests = assignments.map(assignment => 
      this.getSubmission(assignment.assignmentId).pipe(
        map(submissionLink => ({
          assignmentId: assignment.assignmentId,
          hasSubmission: submissionLink !== null,
          submissionLink: submissionLink
        })),
        catchError(() => of({
          assignmentId: assignment.assignmentId,
          hasSubmission: false,
          submissionLink: null
        }))
      )
    );
this.subscriptions.add(
    forkJoin(submissionRequests).subscribe({
      next: (results) => {
        const currentMap = new Map(this.submissionsMap()); // Giữ lại dữ liệu hiện tại
        results.forEach(result => {
          currentMap.set(result.assignmentId, {
            hasSubmission: result.hasSubmission,
            submissionLink: result.submissionLink
          });
        });
        this.submissionsMap.set(currentMap);
      },
      error: err => console.error('❌ Error loading submissions:', err)
    }));
  }

  updateSubmissionForAssignment(assignmentId: number, submissionLink: string | null) {
    const currentMap = new Map(this.submissionsMap());
    currentMap.set(assignmentId, {
      hasSubmission: submissionLink !== null,
      submissionLink: submissionLink
    });
    this.submissionsMap.set(currentMap);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPage) return;
    this.currentPage = page;
    this.loadAssignments();
  }

  getSubmission(assignmentId: number): Observable<string | null> {
    const params = { pageIndex: 1, pageSize: 10 };
    return this.http.get<any>(`${this.baseUrl}/api/submissions/assignment/${assignmentId}`, { params })
      .pipe(
        map(res => {
          const submissions = res.data.items || [];
          const mySubmission = submissions.find((s: any) => s.studentId === this.userId);
          return mySubmission?.submissionLink || null; 
        }),
        catchError(() => of(null))
      );
  }

  hasSubmission(assignmentId: number): boolean {
    const submission = this.submissionsMap().get(assignmentId);
    return submission?.hasSubmission || false;
  }

  getSubmissionLink(assignmentId: number): string | null {
    const submission = this.submissionsMap().get(assignmentId);
    return submission?.submissionLink || null;
  }

  onFileSelected(event: any, assignment: AssignmentDto) {
    const file: File = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('prefix', 'submissions');

    // 1️⃣ Upload file lên GCS
    this.subscriptions.add(
      this.http.post<any>(`${this.baseUrl}/api/storage/upload`, formData).subscribe({
        next: async (res) => {
          if (res.success && res.publicUrl) {
            this.toastr.success('File uploaded successfully!');

            // 2️⃣ Tạo submission
            const submissionReq = {
              assignmentId: assignment.assignmentId,
              studentId: this.userId || '',
              userId: this.userId || '',
              submissionLink: res.publicUrl,
              fileName: res.fileName
            };

            try {
              const submissionRes = await this.http.post<any>(
                `${this.baseUrl}/api/submissions`, submissionReq
              ).toPromise();

              // Cập nhật submission cho assignment này mà không làm mất dữ liệu của các assignment khác
              this.updateSubmissionForAssignment(assignment.assignmentId, res.publicUrl);
              this.toastr.success('Submission created successfully!');
              
              // Reset file input
              event.target.value = '';
            } catch (err) {
              console.error('Error creating submission:', err);
              this.toastr.error('Failed to create submission. Please try again.');
            }
          }
        },
        error: err => {
          console.error('Error uploading file:', err);
          this.toastr.error('Failed to upload file. Please try again.');
        }
      })
    );
  }

ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}