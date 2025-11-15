export interface AssignmentDto {
  assignmentId: number;
  courseId: number;
  title: string;
  startDate: string;   // hoặc Date nếu bạn parse sang Date trong code
  dueDate: string;     // hoặc Date
  assignmentLink: string;
}