// Instructor Models based on API documentation

export interface DashboardViewModel {
  earningMonth: number;
  earningDay: number;
  numStudent: number;
  rating: number;
  listStudent: StudentCourse[];
}

export interface StudentCourse {
  studentCourseId: number;
  studentId: string;
  courseId: number;
  progress: number;
  certificateStatus: number;
  enrollmentDate: Date;
  completionDate: Date | null;
  student: AppUser;
  course: CourseModel;
}

export interface AppUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profileImagePath: string | null;
  email?: string;
  userName?: string;
}

export interface CourseModel {
  courseId: number;
  title: string;
  courseCode: string;
  description: string | null;
  price: number;
  instructorId: string;
  categoryId: number;
  createDate: Date;
  level: string;
  status: string;
  coverImagePath: string | null;
  endDate?: Date | null;
}

export interface CreateCourseDto {
  title: string;
  courseCode: string;
  description: string | null;
  coverImagePath: string | null;
  instructorId: string;
  categoryId: number;
  level: number; // 0: Beginner, 1: Intermediate, 2: Advanced
  status: number | null; // 0: Draft, 1: Published, 2: Archived, 3: Active, 4: Inactive
  price: number;
  endDate: Date | null;
}

export interface UpdateCourseDto {
  title: string;
  courseCode: string;
  description: string | null;
  coverImagePath: string | null;
  categoryId: number;
  level: number;
  price: number;
  endDate: Date | null;
}

// Lecture Models
export interface LectureDTO {
  lectureId: number;
  courseId: number;
  title: string;
  description: string;
  upLoadDate: Date;
  lectureFiles: LectureFileDTO[];
}

export interface LectureFileDTO {
  fileId: number;
  lectureId: number;
  fileName: string;
  fileType: number; // 0: Image, 1: Video, 2: Document, 3: Other
  filePath: string;
  fileExtension: string;
  uploadDate: Date;
}

export interface CreateLectureDto {
  courseId: number;
  title: string;
  description: string;
}

export interface UpdateLectureDto {
  lectureId: number;
  title: string | null;
  description: string | null;
}

export interface CreateLectureFileDto {
  lectureId: number;
  fileName: string;
  fileType: number;
  filePath: string;
  fileExtension: string;
}

// Material Models
export interface CourseMaterialDTO {
  materialId: number;
  courseId: number;
  fileType: number;
  fIleName: string;
  fileExtension: string;
  materialsLink: string;
  uploadDate: Date;
}

export interface CreateCourseMaterialDto {
  courseId: number;
  fileType: number;
  fIleName: string;
  fileExtension: string;
  materialsLink: string;
}

export interface UpdateCourseMaterialDto {
  materialId: number;
  courseId: number | null;
  fileType: number | null;
  fIleName: string | null;
  fileExtension: string | null;
  materialsLink: string | null;
}

// Test Models
export interface TestDTO {
  testId: number;
  title: string;
  description: string | null;
  courseId: number;
  startTime: Date;
  testTime: string | null; // TimeSpan format: "HH:mm:ss"
  endTime: Date;
  numberOfQuestion: number;
  status: number; // 0: Active, 1: Inactive, 2: Completed
  passingScore: number | null;
  alowRedo: string;
  numberOfMaxAttempt: number | null;
}

export interface CreateTestDto {
  title: string;
  description: string | null;
  courseId: number;
  startTime: Date;
  testTime: string | null; // "HH:mm:ss"
  endTime: Date;
  numberOfQuestion: number;
  status: number;
  passingScore: number | null;
  alowRedo: string;
  numberOfMaxAttempt: number | null;
}

export interface UpdateTestDto {
  title: string;
  description: string | null;
  startTime: Date;
  testTime: string | null;
  endTime: Date;
  numberOfQuestion: number;
  status: number;
  passingScore: number | null;
  alowRedo: string;
  numberOfMaxAttempt: number | null;
}

export interface TestScoreDTO {
  testScoreId: number;
  studentId: string;
  testId: number;
  doTestAt: Date;
  scoreValue: number;
  numberOfAttempt: number;
  student: AppUser;
  test: TestDTO;
}

// Question Models
export interface QuestionDTO {
  questionId: number;
  testId: number;
  questionContent: string;
  answerA: string;
  answerB: string;
  answerC: string;
  answerD: string;
  correctAnswer: "A" | "B" | "C" | "D" | null;
  imagePath: string | null;
}

export interface CreateQuestionDto {
  testId: number;
  questionContent: string;
  answerA: string;
  answerB: string;
  answerC: string;
  answerD: string;
  correctAnswer: "A" | "B" | "C" | "D";
  imagePath: string | null;
}

export interface UpdateQuestionDto {
  questionId: number;
  questionContent: string | null;
  answerA: string | null;
  answerB: string | null;
  answerC: string | null;
  answerD: string | null;
  correctAnswer: "A" | "B" | "C" | "D" | null;
  imagePath: string | null;
}

export interface CreateQuestionsListDto {
  testId: number;
  questions: CreateQuestionDto[];
}

// Assignment Models
export interface AssignmentDTO {
  assignmentId: number;
  courseId: number;
  title: string;
  startDate: Date;
  dueDate: Date;
  assignmentLink: string;
}

export interface CreateAssignmentDto {
  courseId: number;
  title: string;
  startDate: Date;
  dueDate: Date;
  assignmentLink: string;
}

export interface UpdateAssignmentDto {
  title: string;
  startDate: Date;
  dueDate: Date;
  assignmentLink: string;
}

export interface SubmissionDTO {
  submissionId: number;
  assignmentId: number;
  studentId: string;
  submissionLink: string;
  submissionDate: Date;
  fileName: string;
  student: AppUser;
  assignment?: AssignmentDTO;
}

export interface ScoreAssignmentDto {
  assignmentId: number;
  studentId: string;
  score: number;
}

export interface AssignmentScoreDTO {
  assignmentScoreId: number;
  studentId: string;
  assignmentId: number;
  score: number;
}

export interface CreateAssignmentScoreDto {
  studentId: string;
  assignmentId: number;
  score: number;
}

export interface UpdateAssignmentScoreDto {
  score: number;
}

// Comment Models
export interface CommentDTO {
  commentId: number;
  lectureId: number;
  content: string;
  timestamp: Date;
  parentCmtId: number | null;
  user: AppUser;
  file: {
    filePath: string;
  } | null;
}

export interface CreateCommentDto {
  lectureId: number;
  content: string;
  parentCmtId: number | null;
  file: {
    fileName: string | null;
    filePath: string | null;
  } | null;
}

// Live Stream Models (placeholder - may need to be updated based on actual API)
export interface LiveStreamDTO {
  livestreamId: string;
  userId: string;
  courseId: number;
  title: string;
  createDate: Date;
  updateDate: Date;
  scheduleStartTime: Date;
  scheduleLiveDuration: string; // TimeSpan format
  thumbnailPath?: string | null;
}

export interface CreateLiveStreamDto {
  courseId: number;
  title: string;
  scheduleStartTime: Date;
  scheduleLiveDuration: string; // "HH:mm"
}

// Payment Models
export interface PaymentDTO {
  paymentId: number;
  courseId: number;
  courseTitle: string;
  amount: number;
  status: string; // "Completed", "Pending", "Failed", "Refunded"
  paymentDate: Date | string;
  orderCode: number;
  checkoutUrl: string | null;
  description: string | null;
}

export interface PaymentResponse {
  payments: PaymentDTO[];
}

