export interface CourseDto {
    courseId: number;        // ID của khóa học
  title: string;           // Tên khóa học
  courseCode: string;      // Mã khóa học
  description?: string;    // Mô tả (có thể null)
  price: number;           // Giá
  instructorId: string;    // ID giảng viên
  categoryId: number;      // ID danh mục
  createDate: string;      // Dạng ISO string từ backend (DateTime)
  level: string;           // Cấp độ (Beginner, Intermediate, Advanced)
  status: string; 
  coverImagePath: string;
}