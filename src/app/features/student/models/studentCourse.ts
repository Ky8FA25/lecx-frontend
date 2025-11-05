import { CertificateStatus } from "../../../core/enums/enums";
import { IInstructor } from "../../../core/models/instructor";
import { CourseDto } from "../../courses/models/course-dto.model";

export interface StudentCourse {
  studentCourseId: number;
  studentId: string;
  courseId: number;
  progress: number;
  certificateStatus: CertificateStatus;
  enrollmentDate: string;       // hoặc Date nếu bạn parse lại
  completionDate?: string | null;
  course?: CourseDto;
  instructor: IInstructor;
}