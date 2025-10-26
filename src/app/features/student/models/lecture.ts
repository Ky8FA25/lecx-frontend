export interface LectureFileDto {
  fileId?: number;
  lectureId: number;
  fileName: string;
  fileType: string; // Enum dưới dạng string (Video, PDF, DOCX, ...)
  filePath: string;
  fileExtension: string;
  uploadDate: string;
}

export interface LectureDTO {
  lectureId?: number;
  courseId: number;
  title: string;
  description: string;
  upLoadDate: string;
  lectureFiles: LectureFileDto[];
}
