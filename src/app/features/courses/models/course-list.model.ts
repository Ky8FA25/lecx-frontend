import { CourseDto } from "./course-dto.model";

export interface CourseList {
    courselist : CourseDto[];
    totalItems : number;
    pageIndex : number;
}