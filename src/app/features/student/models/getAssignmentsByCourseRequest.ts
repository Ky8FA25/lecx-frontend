import { AssignmentDto } from "../../../core/models/asignment";
import { ApiResponse, PaginatedResponse } from "../../../core/models/generic-response-class";

export interface GetAssignmentsByCourseResponse
  extends ApiResponse<PaginatedResponse<AssignmentDto>> {}

export interface GetAssignmentsByCourseRequest {
  searchWord?: string;
  courseId?: number;
  dateSearch?: string;
  pageIndex: number;
  pageSize: number;
}