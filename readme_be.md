# Tài Liệu API - LecX Backend

## Tổng Quan

LecX Backend là một hệ thống quản lý học tập trực tuyến (Learning Management System) được xây dựng bằng .NET 8, sử dụng FastEndpoints framework và MediatR pattern.

### Công Nghệ Sử Dụng
- .NET 8
- FastEndpoints
- MediatR (CQRS Pattern)
- Entity Framework Core
- ASP.NET Core Identity
- JWT Authentication
- Google Cloud Storage
- PayOS Payment Gateway

### Base URL
```
http://localhost:5000/api
```

### Authentication
Hầu hết các API yêu cầu JWT Bearer Token trong header:
```
Authorization: Bearer {accessToken}
```

Refresh token được lưu trong HTTP-only cookie.

---

## Enums

### Role
- `1` - Admin
- `2` - Student
- `3` - Instructor

### CourseLevel
- `0` - Beginner
- `1` - Intermediate
- `2` - Advanced

### CourseStatus
- `0` - Draft
- `1` - Published
- `2` - Archived
- `3` - Active
- `4` - Inactive

### TestStatus
- `0` - Active
- `1` - Inactive
- `2` - Completed

### CertificateStatus
- `0` - Pending
- `1` - Completed

### FileType
- `0` - Image
- `1` - Video
- `2` - Document
- `3` - Other

### PaymentStatus
- `0` - Pending
- `1` - Completed
- `2` - Failed
- `3` - Refunded

### Gender
- `0` - Male
- `1` - Female

---

## 1. Authentication APIs

### 1.1. Đăng Ký (Register)
**Endpoint:** `POST /api/auth/register`  
**Authentication:** Không yêu cầu  
**Request Body:**
```json
{
  "email": "string",
  "phoneNumber": "string | null",
  "password": "string",
  "confirmPassword": "string",
  "firstName": "string",
  "lastName": "string | null",
  "returnUrl": "string | null"
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "userId": "string"
}
```

---

### 1.2. Đăng Nhập (Login)
**Endpoint:** `POST /api/auth/login`  
**Authentication:** Không yêu cầu  
**Request Body:**
```json
{
  "emailOrUserName": "string",
  "password": "string",
  "returnUrl": "string | null"
}
```

**Response:**
```json
{
  "accessToken": "string",
  "accessTokenExpiresUtc": "2024-01-01T00:00:00Z",
  "refreshTokenPlain": "string",
  "refreshTokenExpiresUtc": "2024-01-01T00:00:00Z",
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string | null",
    "lastName": "string | null",
    "avatarUrl": "string | null",
    "roles": ["string"]
  },
  "returnUrl": "string"
}
```

**Lưu ý:** Refresh token sẽ được set trong HTTP-only cookie.

---

### 1.3. Refresh Token
**Endpoint:** `POST /api/auth/refresh`  
**Authentication:** Không yêu cầu (refresh token từ cookie)  
**Request Body:**
```json
{
  "returnUrl": "string | null"
}
```

**Response:** Giống như Login response

---

### 1.4. Đăng Xuất (Logout)
**Endpoint:** `POST /api/auth/logout`  
**Authentication:** Không yêu cầu (refresh token từ cookie)  
**Request Body:** Không có

**Response:**
```json
{
  "success": true,
  "message": "string"
}
```

---

### 1.5. Xác Nhận Email (Confirm Email)
**Endpoint:** `GET /api/auth/confirm-email`  
**Authentication:** Không yêu cầu  
**Query Parameters:**
- `userId`: string
- `token`: string

**Response:** Success message

---

### 1.6. Quên Mật Khẩu (Forgot Password)
**Endpoint:** `POST /api/auth/forgot-password`  
**Authentication:** Không yêu cầu  
**Request Body:**
```json
{
  "email": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "string"
}
```

---

### 1.7. Đặt Lại Mật Khẩu (Reset Password)
**Endpoint:** `POST /api/auth/reset-password`  
**Authentication:** Không yêu cầu  
**Request Body:**
```json
{
  "userId": "string",
  "token": "string",
  "newPassword": "string",
  "confirmPassword": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "string"
}
```

---

### 1.8. Google Login
**Endpoint:** `GET /api/auth/google-login`  
**Authentication:** Không yêu cầu  
**Response:** Redirect đến Google OAuth

---

### 1.9. Google Callback
**Endpoint:** `GET /api/auth/google-callback`  
**Authentication:** Không yêu cầu  
**Query Parameters:**
- `code`: string
- `state`: string

**Response:** Giống như Login response

---

## 2. OTP APIs

### 2.1. Gửi OTP
**Endpoint:** `POST /api/auth/send-otp`  
**Authentication:** Không yêu cầu  
**Request Body:**
```json
{
  "email": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "string"
}
```

---

### 2.2. Xác Thực OTP
**Endpoint:** `POST /api/auth/verify-otp`  
**Authentication:** Không yêu cầu  
**Request Body:**
```json
{
  "email": "string",
  "otp": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "isValid": true
}
```

---

## 3. User APIs

### 3.1. Lấy Thông Tin Profile
**Endpoint:** `GET /api/profile/me`  
**Authentication:** Yêu cầu  
**Request:** Không có body

**Response:**
```json
{
  "id": "string",
  "firstName": "string",
  "lastName": "string",
  "profileImagePath": "string | null",
  "address": "string | null",
  "dob": "2024-01-01T00:00:00Z | null",
  "gender": 0 | 1 | null,
  "walletUser": 0.0,
  "email": "string"
}
```

---

### 3.2. Cập Nhật Profile
**Endpoint:** `PUT /api/user/profile/edit`  
**Authentication:** Yêu cầu  
**Request Body:**
```json
{
  "firstName": "string | null",
  "lastName": "string | null",
  "address": "string | null",
  "dob": "2024-01-01T00:00:00Z | null",
  "gender": 0 | 1 | null,
  "profileImage": "string | null"
}
```

**Response:**
```json
{
  "success": true,
  "message": "string"
}
```

---

### 3.3. Đổi Mật Khẩu
**Endpoint:** `POST /api/user/change-password`  
**Authentication:** Yêu cầu  
**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string",
  "confirmPassword": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "string"
}
```

---

## 4. Categories APIs

### 4.1. Lấy Tất Cả Categories
**Endpoint:** `GET /api/categories/all`  
**Authentication:** Không yêu cầu  
**Request:** Không có

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "categoryId": 1,
      "categoryName": "string",
      "description": "string | null"
    }
  ]
}
```

---

### 4.2. Lấy Category Theo ID
**Endpoint:** `GET /api/categories/{categoryId}`  
**Authentication:** Không yêu cầu  
**Path Parameters:**
- `categoryId`: int

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "categoryId": 1,
    "categoryName": "string",
    "description": "string | null"
  }
}
```

---

## 5. Courses APIs

### 5.1. Tạo Course
**Endpoint:** `POST /api/courses/create`  
**Authentication:** Yêu cầu (Admin, Instructor)  
**Request Body:**
```json
{
  "createCourseDto": {
    "title": "string",
    "courseCode": "string",
    "description": "string | null",
    "coverImagePath": "string | null",
    "instructorId": "string",
    "categoryId": 1,
    "level": 0 | 1 | 2,
    "status": 0 | 1 | 2 | 3 | 4 | null,
    "price": 0.0,
    "endDate": "2024-01-01T00:00:00Z | null"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "courseId": 1,
    "title": "string",
    "courseCode": "string",
    "description": "string | null",
    "price": 0.0,
    "instructorId": "string",
    "categoryId": 1,
    "createDate": "2024-01-01T00:00:00Z",
    "level": "string",
    "status": "string",
    "coverImagePath": "string | null"
  }
}
```

---

### 5.2. Lấy Tất Cả Courses (Paginated)
**Endpoint:** `GET /api/courses/all`  
**Authentication:** Không yêu cầu  
**Query Parameters:**
- `pageIndex`: int (default: 1)
- `pageSize`: int (default: 10)

**Response:**
```json
{
  "pageIndex": 1,
  "pageSize": 10,
  "totalPages": 1,
  "totalCount": 10,
  "hasPreviousPage": false,
  "hasNextPage": false,
  "items": [
    {
      "courseId": 1,
      "title": "string",
      "courseCode": "string",
      "description": "string | null",
      "price": 0.0,
      "instructorId": "string",
      "categoryId": 1,
      "createDate": "2024-01-01T00:00:00Z",
      "level": "string",
      "status": "string",
      "coverImagePath": "string | null"
    }
  ]
}
```

---

### 5.3. Lấy Course Theo ID
**Endpoint:** `GET /api/courses/{CourseId}`  
**Authentication:** Không yêu cầu  
**Path Parameters:**
- `CourseId`: int

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "courseId": 1,
    "title": "string",
    "courseCode": "string",
    "description": "string | null",
    "price": 0.0,
    "instructorId": "string",
    "categoryId": 1,
    "createDate": "2024-01-01T00:00:00Z",
    "level": "string",
    "status": "string",
    "coverImagePath": "string | null"
  }
}
```

---

### 5.4. Lọc Courses (Filtered)
**Endpoint:** `GET /api/courses/filter`  
**Authentication:** Không yêu cầu  
**Query Parameters:**
- `keyword`: string | null
- `categoryId`: int | null
- `level`: 0 | 1 | 2 | null
- `status`: 0 | 1 | 2 | 3 | 4 | null
- `pageIndex`: int (default: 1)
- `pageSize`: int (default: 10)

**Response:** Giống như GetAllCourses response

---

### 5.5. Cập Nhật Course
**Endpoint:** `PUT /api/courses/{courseId}`  
**Authentication:** Yêu cầu (Admin, Instructor)  
**Path Parameters:**
- `courseId`: int

**Request Body:**
```json
{
  "updateCourseDto": {
    "title": "string",
    "courseCode": "string",
    "description": "string | null",
    "coverImagePath": "string | null",
    "categoryId": 1,
    "level": 0 | 1 | 2,
    "price": 0.0,
    "endDate": "2024-01-01T00:00:00Z | null"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "courseId": 1,
    "title": "string",
    "courseCode": "string",
    "description": "string | null",
    "price": 0.0,
    "instructorId": "string",
    "categoryId": 1,
    "createDate": "2024-01-01T00:00:00Z",
    "level": "string",
    "status": "string",
    "coverImagePath": "string | null"
  }
}
```

---

### 5.6. Đặt Trạng Thái Course
**Endpoint:** `PUT /api/courses/{courseId}/status`  
**Authentication:** Yêu cầu (Admin, Instructor)  
**Path Parameters:**
- `courseId`: int

**Request Body:**
```json
{
  "status": 0 | 1 | 2 | 3 | 4
}
```

**Response:**
```json
{
  "success": true,
  "message": "string"
}
```

---

### 5.7. Xóa Course
**Endpoint:** `DELETE /api/courses/{CourseId}`  
**Authentication:** Yêu cầu (Admin, Instructor)  
**Path Parameters:**
- `CourseId`: int

**Response:**
```json
{
  "success": true,
  "message": "string"
}
```

---

### 5.8. Lấy Courses Theo Instructor
**Endpoint:** `GET /api/courses/instructor/{instructorId?}`  
**Authentication:** Không yêu cầu  
**Path Parameters:**
- `instructorId`: string (optional, nếu không có sẽ lấy từ JWT token)

**Query Parameters:**
- `pageIndex`: int (default: 1)
- `pageSize`: int (default: 10)

**Response:**
```json
{
  "pageIndex": 1,
  "pageSize": 10,
  "totalPages": 1,
  "totalCount": 10,
  "hasPreviousPage": false,
  "hasNextPage": false,
  "items": [
    {
      "courseId": 1,
      "title": "string",
      "courseCode": "string",
      "description": "string | null",
      "price": 0.0,
      "instructorId": "string",
      "categoryId": 1,
      "createDate": "2024-01-01T00:00:00Z",
      "level": "string",
      "status": "string",
      "coverImagePath": "string | null"
    }
  ]
}
```

---

### 5.9. Lấy Course Dashboard
**Endpoint:** `GET /api/instructor/courses/{courseId}/dashboard`  
**Authentication:** Yêu cầu (Instructor, Admin)  
**Path Parameters:**
- `courseId`: int

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "earningMonth": 1000000.0,
    "earningDay": 50000.0,
    "numStudent": 50,
    "rating": 4.5,
    "listStudent": [
      {
        "studentCourseId": 1,
        "studentId": "string",
        "courseId": 1,
        "progress": 75.0,
        "certificateStatus": 0 | 1,
        "enrollmentDate": "2024-01-01T00:00:00Z",
        "completionDate": "2024-01-01T00:00:00Z | null",
        "student": {
          "id": "string",
          "firstName": "string",
          "lastName": "string | null",
          "profileImagePath": "string | null"
        },
        "course": {
          "courseId": 1,
          "title": "string",
          "courseCode": "string",
          "description": "string | null",
          "price": 0.0,
          "instructorId": "string",
          "categoryId": 1,
          "createDate": "2024-01-01T00:00:00Z",
          "level": "string",
          "status": "string",
          "coverImagePath": "string | null"
        }
      }
    ]
  }
}
```

---

## 6. Lectures APIs

### 6.1. Tạo Lecture
**Endpoint:** `POST /api/lectures`  
**Authentication:** Yêu cầu (Admin, Instructor)  
**Request Body:**
```json
{
  "courseId": 1,
  "title": "string",
  "description": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "lectureId": 1,
    "courseId": 1,
    "title": "string",
    "description": "string",
    "upLoadDate": "2024-01-01T00:00:00Z",
    "lectureFiles": []
  }
}
```

---

### 6.2. Lấy Lecture Theo ID
**Endpoint:** `GET /api/lectures/{lectureId}`  
**Authentication:** Yêu cầu (Admin, Instructor, Student)  
**Path Parameters:**
- `lectureId`: int

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "lectureId": 1,
    "courseId": 1,
    "title": "string",
    "description": "string",
    "upLoadDate": "2024-01-01T00:00:00Z",
    "lectureFiles": [
      {
        "fileId": 1,
        "lectureId": 1,
        "fileName": "string",
        "fileType": 0 | 1 | 2 | 3,
        "filePath": "string",
        "fileExtension": "string",
        "uploadDate": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### 6.3. Lấy Lectures Theo Course
**Endpoint:** `GET /api/lectures/course`  
**Authentication:** Yêu cầu (Admin, Instructor, Student)  
**Query Parameters:**
- `courseId`: int

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "lectureId": 1,
      "courseId": 1,
      "title": "string",
      "description": "string",
      "upLoadDate": "2024-01-01T00:00:00Z",
      "lectureFiles": []
    }
  ]
}
```

---

### 6.4. Cập Nhật Lecture
**Endpoint:** `PATCH /api/lectures`  
**Authentication:** Yêu cầu (Admin, Instructor)  
**Request Body:**
```json
{
  "lectureId": 1,
  "title": "string | null",
  "description": "string | null"
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "lectureId": 1,
    "courseId": 1,
    "title": "string",
    "description": "string",
    "upLoadDate": "2024-01-01T00:00:00Z",
    "lectureFiles": []
  }
}
```

---

### 6.5. Xóa Lecture
**Endpoint:** `DELETE /api/lectures/{lectureId}`  
**Authentication:** Yêu cầu (Admin, Instructor)  
**Path Parameters:**
- `lectureId`: int

**Response:**
```json
{
  "success": true,
  "message": "string"
}
```

---

### 6.6. Tạo Lecture File
**Endpoint:** `POST /api/lectures/file`  
**Authentication:** Yêu cầu (Admin, Instructor)  
**Request Body:**
```json
{
  "lectureId": 1,
  "fileName": "string",
  "fileType": 0 | 1 | 2 | 3,
  "filePath": "string",
  "fileExtension": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "fileId": 1,
    "lectureId": 1,
    "fileName": "string",
    "fileType": 0 | 1 | 2 | 3,
    "filePath": "string",
    "fileExtension": "string",
    "uploadDate": "2024-01-01T00:00:00Z"
  }
}
```

---

### 6.7. Cập Nhật Lecture File
**Endpoint:** `PATCH /api/lectures/file`  
**Authentication:** Yêu cầu (Admin, Instructor)  
**Request Body:**
```json
{
  "fileId": 1,
  "fileName": "string | null",
  "filePath": "string | null"
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "fileId": 1,
    "lectureId": 1,
    "fileName": "string",
    "fileType": 0 | 1 | 2 | 3,
    "filePath": "string",
    "fileExtension": "string",
    "uploadDate": "2024-01-01T00:00:00Z"
  }
}
```

---

### 6.8. Xóa Lecture File
**Endpoint:** `DELETE /api/lectures/file/{fileId}`  
**Authentication:** Yêu cầu (Admin, Instructor)  
**Path Parameters:**
- `fileId`: int

**Response:**
```json
{
  "success": true,
  "message": "string"
}
```

---

### 6.9. Đánh Dấu Lecture Hoàn Thành
**Endpoint:** `POST /api/lectures/completed/{lectureId}`  
**Authentication:** Yêu cầu (Student)  
**Path Parameters:**
- `lectureId`: int

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "completionId": 1,
    "lectureId": 1,
    "studentId": "string",
    "completedDate": "2024-01-01T00:00:00Z"
  }
}
```

---

### 6.10. Xóa Đánh Dấu Hoàn Thành
**Endpoint:** `DELETE /api/lectures/completed/{lectureId}`  
**Authentication:** Yêu cầu (Student)  
**Path Parameters:**
- `lectureId`: int

**Response:**
```json
{
  "success": true,
  "message": "string"
}
```

---

### 6.11. Lấy Lectures Đã Hoàn Thành Theo User
**Endpoint:** `GET /api/lectures/course/completed`  
**Authentication:** Yêu cầu (Student)  
**Query Parameters:**
- `courseId`: int

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "completionId": 1,
      "lectureId": 1,
      "studentId": "string",
      "completedDate": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### 6.12. Lấy Students Đã Hoàn Thành Lecture
**Endpoint:** `GET /api/lectures/completed/students`  
**Authentication:** Yêu cầu (Instructor, Admin)  
**Query Parameters:**
- `lectureId`: int

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "id": "string",
      "firstName": "string",
      "lastName": "string | null",
      "profileImagePath": "string | null"
    }
  ]
}
```

---

## 7. Comments APIs

### 7.1. Tạo Comment
**Endpoint:** `POST /api/comments`  
**Authentication:** Yêu cầu  
**Request Body:**
```json
{
  "lectureId": 1,
  "content": "string",
  "parentCmtId": 1 | null,
  "file": {
    "fileName": "string | null",
    "filePath": "string | null"
  } | null
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "commentId": 1,
    "lectureId": 1,
    "content": "string",
    "timestamp": "2024-01-01T00:00:00Z",
    "parentCmtId": 1 | null,
    "user": {
      "id": "string",
      "firstName": "string | null",
      "lastName": "string | null",
      "avatarUrl": "string | null"
    },
    "file": {
      "filePath": "string"
    } | null
  }
}
```

---

### 7.2. Lấy Comment Theo ID
**Endpoint:** `GET /api/comments/{commentId}`  
**Authentication:** Yêu cầu  
**Path Parameters:**
- `commentId`: int

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "commentId": 1,
    "lectureId": 1,
    "content": "string",
    "timestamp": "2024-01-01T00:00:00Z",
    "parentCmtId": 1 | null,
    "user": {
      "id": "string",
      "firstName": "string | null",
      "lastName": "string | null",
      "avatarUrl": "string | null"
    },
    "file": {
      "filePath": "string"
    } | null
  }
}
```

---

### 7.3. Lấy Comments Theo Lecture
**Endpoint:** `GET /api/comments`  
**Authentication:** Yêu cầu  
**Query Parameters:**
- `lectureId`: int
- `parentCmtId`: int | null
- `pageIndex`: int (default: 1)
- `pageSize`: int (default: 10)

**Response:**
```json
{
  "pageIndex": 1,
  "pageSize": 10,
  "totalPages": 1,
  "totalCount": 10,
  "hasPreviousPage": false,
  "hasNextPage": false,
  "items": [
    {
      "commentId": 1,
      "lectureId": 1,
      "content": "string",
      "timestamp": "2024-01-01T00:00:00Z",
      "parentCmtId": 1 | null,
      "user": {
        "id": "string",
        "firstName": "string | null",
        "lastName": "string | null",
        "avatarUrl": "string | null"
      },
      "file": {
        "filePath": "string"
      } | null
    }
  ]
}
```

---

### 7.4. Cập Nhật Comment
**Endpoint:** `PUT /api/comments/{commentId}`  
**Authentication:** Yêu cầu  
**Path Parameters:**
- `commentId`: int

**Request Body:**
```json
{
  "content": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "commentId": 1,
    "lectureId": 1,
    "content": "string",
    "timestamp": "2024-01-01T00:00:00Z",
    "parentCmtId": 1 | null,
    "user": {
      "id": "string",
      "firstName": "string | null",
      "lastName": "string | null",
      "avatarUrl": "string | null"
    },
    "file": {
      "filePath": "string"
    } | null
  }
}
```

---

### 7.5. Xóa Comment
**Endpoint:** `DELETE /api/comments/{commentId}`  
**Authentication:** Yêu cầu  
**Path Parameters:**
- `commentId`: int

**Response:**
```json
{
  "success": true,
  "message": "string"
}
```

---

## 8. Assignments APIs

### 8.1. Tạo Assignment
**Endpoint:** `POST /api/assignments`  
**Authentication:** Yêu cầu (Instructor)  
**Request Body:**
```json
{
  "courseId": 1,
  "title": "string",
  "startDate": "2024-01-01T00:00:00Z",
  "dueDate": "2024-01-01T00:00:00Z",
  "assignmentLink": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "assignmentId": 1,
    "courseId": 1,
    "title": "string",
    "startDate": "2024-01-01T00:00:00Z",
    "dueDate": "2024-01-01T00:00:00Z",
    "assignmentLink": "string"
  }
}
```

---

### 8.2. Lấy Assignment Theo ID
**Endpoint:** `GET /api/assignments/{assignmentId}`  
**Authentication:** Yêu cầu (Admin, Instructor, Student)  
**Path Parameters:**
- `assignmentId`: int

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "assignmentId": 1,
    "courseId": 1,
    "title": "string",
    "startDate": "2024-01-01T00:00:00Z",
    "dueDate": "2024-01-01T00:00:00Z",
    "assignmentLink": "string"
  }
}
```

---

### 8.3. Lấy Assignments Theo Course
**Endpoint:** `GET /api/assignments/filter`  
**Authentication:** Yêu cầu (Admin, Instructor, Student)  
**Query Parameters:**
- `courseId`: int

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "assignmentId": 1,
      "courseId": 1,
      "title": "string",
      "startDate": "2024-01-01T00:00:00Z",
      "dueDate": "2024-01-01T00:00:00Z",
      "assignmentLink": "string"
    }
  ]
}
```

---

### 8.4. Cập Nhật Assignment
**Endpoint:** `PUT /api/assignments/{assignmentId}`  
**Authentication:** Yêu cầu (Instructor)  
**Path Parameters:**
- `assignmentId`: int

**Request Body:**
```json
{
  "title": "string",
  "startDate": "2024-01-01T00:00:00Z",
  "dueDate": "2024-01-01T00:00:00Z",
  "assignmentLink": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "assignmentId": 1,
    "courseId": 1,
    "title": "string",
    "startDate": "2024-01-01T00:00:00Z",
    "dueDate": "2024-01-01T00:00:00Z",
    "assignmentLink": "string"
  }
}
```

---

### 8.5. Xóa Assignment
**Endpoint:** `DELETE /api/assignments/{assignmentId}`  
**Authentication:** Yêu cầu (Instructor)  
**Path Parameters:**
- `assignmentId`: int

**Response:**
```json
{
  "success": true,
  "message": "string"
}
```

---

## 9. Assignment Scores APIs

### 9.1. Tạo Assignment Score
**Endpoint:** `POST /api/assignment-scores`  
**Authentication:** Yêu cầu (Instructor)  
**Request Body:**
```json
{
  "studentId": "string",
  "assignmentId": 1,
  "score": 85.5
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "assignmentScoreId": 1,
    "studentId": "string",
    "assignmentId": 1,
    "score": 85.5
  }
}
```

---

### 9.2. Lấy Assignment Score Theo ID
**Endpoint:** `GET /api/assignment-scores/{assignmentScoreId}`  
**Authentication:** Yêu cầu (Instructor, Admin)  
**Path Parameters:**
- `assignmentScoreId`: int

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "assignmentScoreId": 1,
    "studentId": "string",
    "assignmentId": 1,
    "score": 85.5
  }
}
```

---

### 9.3. Lấy Assignment Score Theo Assignment Và Student
**Endpoint:** `GET /api/assignment-scores/assignment/{assignmentId}/student/{studentId}`  
**Authentication:** Yêu cầu (Instructor, Admin, Student)  
**Path Parameters:**
- `assignmentId`: int
- `studentId`: string

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "assignmentScoreId": 1,
    "studentId": "string",
    "assignmentId": 1,
    "score": 85.5
  }
}
```

---

### 9.4. Lấy Assignment Scores Theo Course
**Endpoint:** `GET /api/assignmentscores/by-course/{courseId}`  
**Authentication:** Yêu cầu (Instructor, Admin)  
**Path Parameters:**
- `courseId`: int

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "assignmentScoreId": 1,
      "studentId": "string",
      "assignmentId": 1,
      "score": 85.5
    }
  ]
}
```

---

### 9.5. Cập Nhật Assignment Score
**Endpoint:** `PUT /api/assignment-scores/{AssignmentScoreId}`  
**Authentication:** Yêu cầu (Instructor)  
**Path Parameters:**
- `AssignmentScoreId`: int

**Request Body:**
```json
{
  "score": 90.0
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "assignmentScoreId": 1,
    "studentId": "string",
    "assignmentId": 1,
    "score": 90.0
  }
}
```

---

### 9.6. Xóa Assignment Score
**Endpoint:** `DELETE /api/assignment-scores/{AssignmentScoreId}`  
**Authentication:** Yêu cầu (Instructor, Admin)  
**Path Parameters:**
- `AssignmentScoreId`: int

**Response:**
```json
{
  "success": true,
  "message": "string"
}
```

---

## 10. Submissions APIs

### 10.1. Tạo Submission
**Endpoint:** `POST /api/submissions`  
**Authentication:** Yêu cầu (Student, Instructor)  
**Request Body:**
```json
{
  "assignmentId": 1,
  "userId": "string",
  "studentId": "string",
  "submissionLink": "string",
  "fileName": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "submissionId": 1,
    "assignmentId": 1,
    "studentId": "string",
    "submissionLink": "string",
    "submissionDate": "2024-01-01T00:00:00Z",
    "fileName": "string",
    "student": {
      "id": "string",
      "firstName": "string | null",
      "lastName": "string | null",
      "avatarUrl": "string | null"
    }
  }
}
```

---

### 10.2. Lấy Submissions Theo Assignment
**Endpoint:** `GET /api/submissions/assignment/{AssignmentId}`  
**Authentication:** Yêu cầu (Instructor, Student)  
**Path Parameters:**
- `AssignmentId`: int

**Query Parameters:**
- `pageIndex`: int (default: 1)
- `pageSize`: int (default: 10)

**Response:**
```json
{
  "pageIndex": 1,
  "pageSize": 10,
  "totalPages": 1,
  "totalCount": 10,
  "hasPreviousPage": false,
  "hasNextPage": false,
  "items": [
    {
      "submissionId": 1,
      "assignmentId": 1,
      "studentId": "string",
      "submissionLink": "string",
      "submissionDate": "2024-01-01T00:00:00Z",
      "fileName": "string",
      "student": {
        "id": "string",
        "firstName": "string | null",
        "lastName": "string | null",
        "avatarUrl": "string | null"
      }
    }
  ]
}
```

---

### 10.3. Cập Nhật Submission
**Endpoint:** `PUT /api/submissions/{submissionId}`  
**Authentication:** Yêu cầu (Student, Instructor)  
**Path Parameters:**
- `submissionId`: int

**Request Body:**
```json
{
  "submissionLink": "string",
  "fileName": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "submissionId": 1,
    "assignmentId": 1,
    "studentId": "string",
    "submissionLink": "string",
    "submissionDate": "2024-01-01T00:00:00Z",
    "fileName": "string",
    "student": {
      "id": "string",
      "firstName": "string | null",
      "lastName": "string | null",
      "avatarUrl": "string | null"
    }
  }
}
```

---

### 10.4. Xóa Submission
**Endpoint:** `DELETE /api/submissions/{submissionId}`  
**Authentication:** Yêu cầu (Student, Instructor)  
**Path Parameters:**
- `submissionId`: int

**Response:**
```json
{
  "success": true,
  "message": "string"
}
```

---

## 10. Instructor Confirmations APIs

### 10.1. Tạo Instructor Confirmation
**Endpoint:** `POST /api/instructor-confirmations`  
**Authentication:** Yêu cầu (Student)  
**Request Body:**
```json
{
  "fileName": "string",
  "certificatelink": "string",
  "description": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "confirmationId": 1,
    "userId": "string",
    "fileName": "string",
    "certificatelink": "string",
    "sendDate": "2024-01-01T00:00:00Z",
    "description": "string",
    "user": {
      "userId": "string",
      "fullName": "string",
      "email": "string",
      "profileImagePath": "string | null"
    }
  }
}
```

**Lưu ý:** `userId` tự động lấy từ JWT token, không cần truyền trong request body.

---

### 10.2. Phê Duyệt Instructor Confirmation
**Endpoint:** `PUT /api/instructor-confirmations/approve`  
**Authentication:** Yêu cầu (Admin)  
**Request Body:**
```json
{
  "confirmationId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "confirmationId": 1,
    "userId": "string",
    "fileName": "string",
    "certificatelink": "string",
    "sendDate": "2024-01-01T00:00:00Z",
    "description": "string",
    "user": {
      "userId": "string",
      "fullName": "string",
      "email": "string",
      "profileImagePath": "string | null"
    }
  }
}
```

**Lưu ý:** API này sẽ tự động tạo bản ghi Instructor cho user sau khi phê duyệt.

---

## 11. Tests APIs

### 11.1. Tạo Test
**Endpoint:** `POST /api/tests`  
**Authentication:** Yêu cầu (Instructor, Admin)  
**Request Body:**
```json
{
  "title": "string",
  "description": "string | null",
  "courseId": 1,
  "startTime": "2024-01-01T00:00:00Z",
  "testTime": "01:00:00 | null",
  "endTime": "2024-01-01T00:00:00Z",
  "numberOfQuestion": 10,
  "status": 0 | 1 | 2,
  "passingScore": 70.0 | null,
  "alowRedo": "string",
  "numberOfMaxAttempt": 3 | null
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "testId": 1,
    "title": "string",
    "description": "string | null",
    "courseId": 1,
    "startTime": "2024-01-01T00:00:00Z",
    "testTime": "01:00:00 | null",
    "endTime": "2024-01-01T00:00:00Z",
    "numberOfQuestion": 10,
    "status": 0 | 1 | 2,
    "passingScore": 70.0 | null,
    "alowRedo": "string",
    "numberOfMaxAttempt": 3 | null
  }
}
```

---

### 11.2. Lấy Test Theo ID
**Endpoint:** `GET /api/tests/{TestId}`  
**Authentication:** Yêu cầu (Instructor, Admin, Student)  
**Path Parameters:**
- `TestId`: int

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "testId": 1,
    "title": "string",
    "description": "string | null",
    "courseId": 1,
    "startTime": "2024-01-01T00:00:00Z",
    "testTime": "01:00:00 | null",
    "endTime": "2024-01-01T00:00:00Z",
    "numberOfQuestion": 10,
    "status": 0 | 1 | 2,
    "passingScore": 70.0 | null,
    "alowRedo": "string",
    "numberOfMaxAttempt": 3 | null
  }
}
```

---

### 11.3. Lấy Tests Theo Course
**Endpoint:** `GET /api/tests`  
**Authentication:** Yêu cầu (Instructor, Admin, Student)  
**Query Parameters:**
- `courseId`: int

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "testId": 1,
      "title": "string",
      "description": "string | null",
      "courseId": 1,
      "startTime": "2024-01-01T00:00:00Z",
      "testTime": "01:00:00 | null",
      "endTime": "2024-01-01T00:00:00Z",
      "numberOfQuestion": 10,
      "status": 0 | 1 | 2,
      "passingScore": 70.0 | null,
      "alowRedo": "string",
      "numberOfMaxAttempt": 3 | null
    }
  ]
}
```

---

### 11.4. Cập Nhật Test
**Endpoint:** `PUT /api/tests/{TestId}`  
**Authentication:** Yêu cầu (Instructor, Admin)  
**Path Parameters:**
- `TestId`: int

**Request Body:**
```json
{
  "title": "string",
  "description": "string | null",
  "startTime": "2024-01-01T00:00:00Z",
  "testTime": "01:00:00 | null",
  "endTime": "2024-01-01T00:00:00Z",
  "numberOfQuestion": 10,
  "status": 0 | 1 | 2,
  "passingScore": 70.0 | null,
  "alowRedo": "string",
  "numberOfMaxAttempt": 3 | null
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "testId": 1,
    "title": "string",
    "description": "string | null",
    "courseId": 1,
    "startTime": "2024-01-01T00:00:00Z",
    "testTime": "01:00:00 | null",
    "endTime": "2024-01-01T00:00:00Z",
    "numberOfQuestion": 10,
    "status": 0 | 1 | 2,
    "passingScore": 70.0 | null,
    "alowRedo": "string",
    "numberOfMaxAttempt": 3 | null
  }
}
```

---

### 11.5. Xóa Test
**Endpoint:** `DELETE /api/tests/{TestId}`  
**Authentication:** Yêu cầu (Instructor, Admin)  
**Path Parameters:**
- `TestId`: int

**Response:**
```json
{
  "success": true,
  "message": "string"
}
```

---

## 12. Test Questions APIs

### 12.1. Tạo Question
**Endpoint:** `POST /api/tests/questions`  
**Authentication:** Yêu cầu (Instructor)  
**Request Body:**
```json
{
  "testId": 1,
  "questionContent": "string",
  "answerA": "string",
  "answerB": "string",
  "answerC": "string",
  "answerD": "string",
  "correctAnswer": "A | B | C | D",
  "imagePath": "string | null"
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "questionId": 1,
    "testId": 1,
    "questionContent": "string",
    "answerA": "string",
    "answerB": "string",
    "answerC": "string",
    "answerD": "string",
    "correctAnswer": "A | B | C | D | null",
    "imagePath": "string | null"
  }
}
```

---

### 12.2. Tạo Nhiều Questions
**Endpoint:** `POST /api/tests/questions/lists`  
**Authentication:** Yêu cầu (Instructor)  
**Request Body:**
```json
{
  "testId": 1,
  "questions": [
    {
      "questionContent": "string",
      "answerA": "string",
      "answerB": "string",
      "answerC": "string",
      "answerD": "string",
      "correctAnswer": "A | B | C | D",
      "imagePath": "string | null"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "questionId": 1,
      "testId": 1,
      "questionContent": "string",
      "answerA": "string",
      "answerB": "string",
      "answerC": "string",
      "answerD": "string",
      "correctAnswer": "A | B | C | D | null",
      "imagePath": "string | null"
    }
  ]
}
```

---

### 12.3. Lấy Question Theo ID
**Endpoint:** `GET /api/tests/questions/{QuestionId}`  
**Authentication:** Yêu cầu (Instructor)  
**Path Parameters:**
- `QuestionId`: int

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "questionId": 1,
    "testId": 1,
    "questionContent": "string",
    "answerA": "string",
    "answerB": "string",
    "answerC": "string",
    "answerD": "string",
    "correctAnswer": "A | B | C | D | null",
    "imagePath": "string | null"
  }
}
```

---

### 12.4. Lấy Questions Theo Test
**Endpoint:** `GET /api/tests/{TestId}/questions`  
**Authentication:** Yêu cầu (Instructor)  
**Path Parameters:**
- `TestId`: int

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "questionId": 1,
      "testId": 1,
      "questionContent": "string",
      "answerA": "string",
      "answerB": "string",
      "answerC": "string",
      "answerD": "string",
      "correctAnswer": "A | B | C | D | null",
      "imagePath": "string | null"
    }
  ]
}
```

---

### 12.5. Lấy Questions Để Làm Test (Không có đáp án)
**Endpoint:** `GET /api/tests/{TestId}/attempt/questions`  
**Authentication:** Yêu cầu (Student)  
**Path Parameters:**
- `TestId`: int

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "questionId": 1,
      "testId": 1,
      "questionContent": "string",
      "answerA": "string",
      "answerB": "string",
      "answerC": "string",
      "answerD": "string",
      "correctAnswer": null,
      "imagePath": "string | null"
    }
  ]
}
```

**Lưu ý:** `correctAnswer` sẽ là `null` để học sinh không biết đáp án đúng.

---

### 12.6. Cập Nhật Question
**Endpoint:** `PUT /api/tests/questions`  
**Authentication:** Yêu cầu (Instructor)  
**Request Body:**
```json
{
  "questionId": 1,
  "questionContent": "string | null",
  "answerA": "string | null",
  "answerB": "string | null",
  "answerC": "string | null",
  "answerD": "string | null",
  "correctAnswer": "A | B | C | D | null",
  "imagePath": "string | null"
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "questionId": 1,
    "testId": 1,
    "questionContent": "string",
    "answerA": "string",
    "answerB": "string",
    "answerC": "string",
    "answerD": "string",
    "correctAnswer": "A | B | C | D | null",
    "imagePath": "string | null"
  }
}
```

---

### 12.7. Xóa Question
**Endpoint:** `DELETE /api/tests/questions/{QuestionId}`  
**Authentication:** Yêu cầu (Instructor)  
**Path Parameters:**
- `QuestionId`: int

**Response:**
```json
{
  "success": true,
  "message": "string"
}
```

---

## 13. Test Scores APIs

### 13.1. Nộp Bài Test (Tạo Test Score)
**Endpoint:** `POST /api/tests/scores`  
**Authentication:** Yêu cầu (Student)  
**Request Body:**
```json
{
  "testId": 1,
  "answers": [
    {
      "questionId": 1,
      "selectedAnswer": "A"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "testScoreId": 1,
    "studentId": "string",
    "testId": 1,
    "doTestAt": "2024-01-01T00:00:00Z",
    "scoreValue": 85.5,
    "numberOfAttempt": 1,
    "student": {
      "id": "string",
      "firstName": "string",
      "lastName": "string | null",
      "profileImagePath": "string | null"
    },
    "test": {
      "testId": 1,
      "title": "string",
      "description": "string | null",
      "courseId": 1,
      "startTime": "2024-01-01T00:00:00Z",
      "testTime": "01:00:00 | null",
      "endTime": "2024-01-01T00:00:00Z",
      "numberOfQuestion": 10,
      "status": 0 | 1 | 2,
      "passingScore": 70.0 | null,
      "alowRedo": "string",
      "numberOfMaxAttempt": 3 | null
    }
  }
}
```

---

### 13.2. Lấy Test Score Theo ID
**Endpoint:** `GET /api/tests/scores/{TestScoreId}`  
**Authentication:** Yêu cầu (Student, Instructor, Admin)  
**Path Parameters:**
- `TestScoreId`: int

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "testScoreId": 1,
    "studentId": "string",
    "testId": 1,
    "doTestAt": "2024-01-01T00:00:00Z",
    "scoreValue": 85.5,
    "numberOfAttempt": 1,
    "student": {
      "id": "string",
      "firstName": "string",
      "lastName": "string | null",
      "profileImagePath": "string | null"
    },
    "test": {
      "testId": 1,
      "title": "string",
      "description": "string | null",
      "courseId": 1,
      "startTime": "2024-01-01T00:00:00Z",
      "testTime": "01:00:00 | null",
      "endTime": "2024-01-01T00:00:00Z",
      "numberOfQuestion": 10,
      "status": 0 | 1 | 2,
      "passingScore": 70.0 | null,
      "alowRedo": "string",
      "numberOfMaxAttempt": 3 | null
    }
  }
}
```

---

### 13.3. Lấy Test Scores Theo User
**Endpoint:** `GET /api/tests/scores`  
**Authentication:** Yêu cầu (Student)  
**Query Parameters:**
- `pageIndex`: int (default: 1)
- `pageSize`: int (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "pageIndex": 1,
    "pageSize": 10,
    "totalPages": 1,
    "totalCount": 10,
    "hasPreviousPage": false,
    "hasNextPage": false,
    "items": [
      {
        "testScoreId": 1,
        "studentId": "string",
        "testId": 1,
        "doTestAt": "2024-01-01T00:00:00Z",
        "scoreValue": 85.5,
        "numberOfAttempt": 1,
        "student": {
          "id": "string",
          "firstName": "string",
          "lastName": "string | null",
          "profileImagePath": "string | null"
        },
        "test": {
          "testId": 1,
          "title": "string",
          "description": "string | null",
          "courseId": 1,
          "startTime": "2024-01-01T00:00:00Z",
          "testTime": "01:00:00 | null",
          "endTime": "2024-01-01T00:00:00Z",
          "numberOfQuestion": 10,
          "status": 0 | 1 | 2,
          "passingScore": 70.0 | null,
          "alowRedo": "string",
          "numberOfMaxAttempt": 3 | null
        }
      }
    ]
  }
}
```

---

### 13.4. Lấy Test Scores Theo Test (Tất cả học sinh)
**Endpoint:** `GET /api/tests/{TestId}/scores`  
**Authentication:** Yêu cầu (Instructor, Admin)  
**Path Parameters:**
- `TestId`: int

**Query Parameters:**
- `pageIndex`: int (default: 1)
- `pageSize`: int (default: 10)

**Response:** Giống như GetTestScoresByUser response

---

### 13.5. Kiểm Tra Đã Pass Test Chưa
**Endpoint:** `GET /api/tests/{TestId}/is-passed`  
**Authentication:** Yêu cầu (Student)  
**Path Parameters:**
- `TestId`: int

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "isPassed": true,
    "testScoreId": 1,
    "scoreValue": 85.5
  }
}
```

---

### 13.6. Xóa Test Score
**Endpoint:** `DELETE /api/tests/scores/{TestScoreId}`  
**Authentication:** Yêu cầu (Instructor, Admin)  
**Path Parameters:**
- `TestScoreId`: int

**Response:**
```json
{
  "success": true,
  "message": "string"
}
```

---

## 14. Student Courses APIs

### 14.1. Tạo Student Course (Đăng Ký Khóa Học)
**Endpoint:** `POST /api/student-courses`  
**Authentication:** Yêu cầu (Admin)  
**Request Body:**
```json
{
  "studentId": "string",
  "courseId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "studentCourseId": 1,
    "studentId": "string",
    "courseId": 1,
    "progress": 0.0,
    "certificateStatus": 0 | 1,
    "enrollmentDate": "2024-01-01T00:00:00Z",
    "completionDate": "2024-01-01T00:00:00Z | null",
    "student": {
      "id": "string",
      "firstName": "string",
      "lastName": "string | null",
      "profileImagePath": "string | null"
    },
    "course": {
      "courseId": 1,
      "title": "string",
      "courseCode": "string",
      "description": "string | null",
      "price": 0.0,
      "instructorId": "string",
      "categoryId": 1,
      "createDate": "2024-01-01T00:00:00Z",
      "level": "string",
      "status": "string",
      "coverImagePath": "string | null"
    }
  }
}
```

---

### 14.2. Lấy Student Course Theo ID
**Endpoint:** `GET /api/student-courses/{studentCourseId}`  
**Authentication:** Yêu cầu (Admin, Instructor, Student)  
**Path Parameters:**
- `studentCourseId`: int

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "studentCourseId": 1,
    "studentId": "string",
    "courseId": 1,
    "progress": 0.0,
    "certificateStatus": 0 | 1,
    "enrollmentDate": "2024-01-01T00:00:00Z",
    "completionDate": "2024-01-01T00:00:00Z | null",
    "student": {
      "id": "string",
      "firstName": "string",
      "lastName": "string | null",
      "profileImagePath": "string | null"
    },
    "course": {
      "courseId": 1,
      "title": "string",
      "courseCode": "string",
      "description": "string | null",
      "price": 0.0,
      "instructorId": "string",
      "categoryId": 1,
      "createDate": "2024-01-01T00:00:00Z",
      "level": "string",
      "status": "string",
      "coverImagePath": "string | null"
    }
  }
}
```

---

### 14.3. Lấy Courses Theo Student (Lọc)
**Endpoint:** `GET /api/student-courses/courses`  
**Authentication:** Yêu cầu (Student)  
**Query Parameters:**
- `courseId`: int | null
- `keyword`: string | null
- `categoryId`: int | null
- `level`: 0 | 1 | 2 | null
- `certificateStatus`: 0 | 1 | null
- `pageIndex`: int (default: 1)
- `pageSize`: int (default: 10)

**Response:**
```json
{
  "pageIndex": 1,
  "pageSize": 10,
  "totalPages": 1,
  "totalCount": 10,
  "hasPreviousPage": false,
  "hasNextPage": false,
  "items": [
    {
      "studentCourseId": 1,
      "studentId": "string",
      "courseId": 1,
      "progress": 0.0,
      "certificateStatus": 0 | 1,
      "enrollmentDate": "2024-01-01T00:00:00Z",
      "completionDate": "2024-01-01T00:00:00Z | null",
      "student": {
        "id": "string",
        "firstName": "string",
        "lastName": "string | null",
        "profileImagePath": "string | null"
      },
      "course": {
        "courseId": 1,
        "title": "string",
        "courseCode": "string",
        "description": "string | null",
        "price": 0.0,
        "instructorId": "string",
        "categoryId": 1,
        "createDate": "2024-01-01T00:00:00Z",
        "level": "string",
        "status": "string",
        "coverImagePath": "string | null"
      }
    }
  ]
}
```

---

### 14.4. Lấy Students Theo Course (Lọc)
**Endpoint:** `GET /api/student-courses/students`  
**Authentication:** Yêu cầu (Instructor, Admin)  
**Query Parameters:**
- `courseId`: int
- `keyword`: string | null
- `pageIndex`: int (default: 1)
- `pageSize`: int (default: 10)

**Response:** PaginatedResponse với danh sách StudentCourseDTO

---

### 14.5. Kiểm Tra Student Đã Đăng Ký Course Chưa
**Endpoint:** `GET /api/student-courses/check-exist`  
**Authentication:** Yêu cầu (Student)  
**Query Parameters:**
- `courseId`: int

**Response:**
```json
{
  "exists": true,
  "studentCourseId": 1
}
```

---

### 14.6. Cập Nhật Student Course
**Endpoint:** `PUT /api/student-courses`  
**Authentication:** Yêu cầu (Admin, Instructor)  
**Request Body:**
```json
{
  "studentId": "string",
  "courseId": 1,
  "progress": 50.0 | null,
  "certificateStatus": 0 | 1 | null,
  "completionDate": "2024-01-01T00:00:00Z | null"
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "studentCourseId": 1,
    "studentId": "string",
    "courseId": 1,
    "progress": 50.0,
    "certificateStatus": 0 | 1,
    "enrollmentDate": "2024-01-01T00:00:00Z",
    "completionDate": "2024-01-01T00:00:00Z | null",
    "student": {
      "id": "string",
      "firstName": "string",
      "lastName": "string | null",
      "profileImagePath": "string | null"
    },
    "course": {
      "courseId": 1,
      "title": "string",
      "courseCode": "string",
      "description": "string | null",
      "price": 0.0,
      "instructorId": "string",
      "categoryId": 1,
      "createDate": "2024-01-01T00:00:00Z",
      "level": "string",
      "status": "string",
      "coverImagePath": "string | null"
    }
  }
}
```

---

### 14.7. Xóa Student Course
**Endpoint:** `DELETE /api/student-courses/{studentCourseId}`  
**Authentication:** Yêu cầu (Admin)  
**Path Parameters:**
- `studentCourseId`: int

**Response:**
```json
{
  "success": true,
  "message": "string"
}
```

---

## 15. Payment APIs

### 15.1. Tạo Payment
**Endpoint:** `POST /api/payments/create`  
**Authentication:** Yêu cầu (Student)  
**Request Body:**
```json
{
  "courseId": 1,
  "returnUrl": "string",
  "cancelUrl": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "paymentId": 1,
    "courseId": 1,
    "courseTitle": "string",
    "amount": 1000000.0,
    "status": "string",
    "paymentDate": "2024-01-01T00:00:00Z",
    "orderCode": 123456,
    "checkoutUrl": "string",
    "description": "string | null"
  }
}
```

---

### 15.2. Lấy Payments Theo Student
**Endpoint:** `GET /api/payments/{StudentId}`  
**Authentication:** Không yêu cầu  
**Path Parameters:**
- `StudentId`: string

**Query Parameters:**
- `pageIndex`: int (default: 1)
- `pageSize`: int (default: 10)

**Response:**
```json
{
  "pageIndex": 1,
  "pageSize": 10,
  "totalPages": 1,
  "totalCount": 10,
  "hasPreviousPage": false,
  "hasNextPage": false,
  "items": [
    {
      "paymentId": 1,
      "courseId": 1,
      "courseTitle": "string",
      "amount": 1000000.0,
      "status": "string",
      "paymentDate": "2024-01-01T00:00:00Z",
      "orderCode": 123456,
      "checkoutUrl": "string | null",
      "description": "string | null"
    }
  ]
}
```

---

### 15.3. Payment Success Callback
**Endpoint:** `GET /api/payments/success`  
**Authentication:** Không yêu cầu  
**Query Parameters:**
- `code`: string
- `status`: string
- `orderCode`: int

**Response:** Redirect hoặc success message

---

### 15.4. Payment Cancel Callback
**Endpoint:** `GET /api/payments/cancel`  
**Authentication:** Không yêu cầu  
**Query Parameters:**
- `code`: string
- `status`: string
- `orderCode`: int

**Response:** Redirect hoặc cancel message

---

## 16. Course Materials APIs

### 16.1. Tạo Course Material
**Endpoint:** `POST /api/course-materials`  
**Authentication:** Yêu cầu (Admin, Instructor)  
**Request Body:**
```json
{
  "courseId": 1,
  "fileType": 0 | 1 | 2 | 3,
  "fileName": "string",
  "fileExtension": "string",
  "materialsLink": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "materialId": 1,
    "courseId": 1,
    "fileType": 0 | 1 | 2 | 3,
    "fileName": "string",
    "fileExtension": "string",
    "materialsLink": "string",
    "uploadDate": "2024-01-01T00:00:00Z"
  }
}
```

---

### 16.2. Lấy Course Material Theo ID
**Endpoint:** `GET /api/course-materials/{materialId}`  
**Authentication:** Yêu cầu (Admin, Instructor)  
**Path Parameters:**
- `materialId`: int

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "materialId": 1,
    "courseId": 1,
    "fileType": 0 | 1 | 2 | 3,
    "fileName": "string",
    "fileExtension": "string",
    "materialsLink": "string",
    "uploadDate": "2024-01-01T00:00:00Z"
  }
}
```

---

### 16.3. Lấy Tất Cả Course Materials Theo Course
**Endpoint:** `GET /api/course-materials/course/{courseId}`  
**Authentication:** Yêu cầu (Admin, Instructor)  
**Path Parameters:**
- `courseId`: int

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "materialId": 1,
      "courseId": 1,
      "fileType": 0 | 1 | 2 | 3,
      "fileName": "string",
      "fileExtension": "string",
      "materialsLink": "string",
      "uploadDate": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### 16.4. Cập Nhật Course Material
**Endpoint:** `PATCH /api/course-materials`  
**Authentication:** Yêu cầu (Admin, Instructor)  
**Request Body:**
```json
{
  "materialId": 1,
  "courseId": 1 | null,
  "fileType": 0 | 1 | 2 | 3 | null,
  "fileName": "string | null",
  "fileExtension": "string | null",
  "materialsLink": "string | null"
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "materialId": 1,
    "courseId": 1,
    "fileType": 0 | 1 | 2 | 3,
    "fileName": "string",
    "fileExtension": "string",
    "materialsLink": "string",
    "uploadDate": "2024-01-01T00:00:00Z"
  }
}
```

---

### 16.5. Xóa Course Material
**Endpoint:** `DELETE /api/course-materials/{materialId}`  
**Authentication:** Yêu cầu (Admin, Instructor)  
**Path Parameters:**
- `materialId`: int

**Response:**
```json
{
  "success": true,
  "message": "string"
}
```

---

## 17. Certificates APIs

### 17.1. Tạo Certificate
**Endpoint:** `POST /api/certificates`  
**Authentication:** Yêu cầu (Admin, Instructor)  
**Request Body:**
```json
{
  "courseId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "data": {
    "certificateId": 1,
    "studentId": "string",
    "courseId": 1,
    "certificateLink": "string",
    "issueDate": "2024-01-01T00:00:00Z"
  }
}
```

---

### 17.2. Xóa Certificate
**Endpoint:** `DELETE /api/certificates/{courseId}`  
**Authentication:** Yêu cầu (Admin, Instructor)  
**Path Parameters:**
- `courseId`: int

**Response:** Success message

---

## 18. Storage APIs

### 18.1. Upload File
**Endpoint:** `POST /api/storage/upload`  
**Authentication:** Không yêu cầu (có thể bật)  
**Request:** Multipart form data
- `file`: File
- `prefix`: string | null (folder path)

**Response:**
```json
{
  "success": true,
  "objectName": "string",
  "publicUrl": "string",
  "fileName": "string"
}
```

**Lưu ý:** Chỉ dùng cho file nhỏ (dưới 20MB)

---

### 18.2. Lấy Signed Read URL
**Endpoint:** `GET /api/storage/signed-read`  
**Authentication:** Không yêu cầu (có thể bật)  
**Query Parameters:**
- `objectName`: string
- `ttlSeconds`: int (default: 300)

**Response:**
```json
{
  "success": true,
  "url": "string"
}
```

---

### 18.3. Lấy Signed Write URL
**Endpoint:** `GET /api/storage/signed-write`  
**Authentication:** Không yêu cầu (có thể bật)  
**Query Parameters:**
- `objectName`: string
- `contentType`: string (default: "application/octet-stream")
- `ttlSeconds`: int (default: 300)

**Response:**
```json
{
  "success": true,
  "url": "string"
}
```

---

### 18.4. Lấy Signed Resumable URL
**Endpoint:** `GET /api/storage/signed-resumable`  
**Authentication:** Không yêu cầu (có thể bật)  
**Query Parameters:**
- `objectName`: string
- `contentType`: string (default: "application/octet-stream")
- `ttlSeconds`: int (default: 300)

**Response:**
```json
{
  "success": true,
  "url": "string"
}
```

**Lưu ý:** Dùng cho upload chunked, client cần gửi kèm header `x-goog-resumable: start`

---

### 18.5. Xóa Object
**Endpoint:** `DELETE /api/storage/delete-object`  
**Authentication:** Yêu cầu (Admin)  
**Request Body:**
```json
{
  "objectName": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "string"
}
```

---

## Error Handling

### Error Response Format
```json
{
  "type": "string",
  "title": "string",
  "status": 400,
  "detail": "string",
  "instance": "string",
  "errors": {
    "fieldName": ["error message"]
  }
}
```

### Common HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Pagination

### Paginated Response Format
```json
{
  "pageIndex": 1,
  "pageSize": 10,
  "totalPages": 1,
  "totalCount": 10,
  "hasPreviousPage": false,
  "hasNextPage": false,
  "items": []
}
```

### Pagination Query Parameters
- `pageIndex`: int (bắt đầu từ 1, default: 1)
- `pageSize`: int (default: 10)

---

## Authentication Flow

1. **Đăng nhập:** Gọi `POST /api/auth/login` với email/password
2. **Nhận token:** Access token trong response body, refresh token trong HTTP-only cookie
3. **Sử dụng token:** Gửi access token trong header `Authorization: Bearer {token}`
4. **Refresh token:** Khi access token hết hạn, gọi `POST /api/auth/refresh` (refresh token tự động lấy từ cookie)
5. **Đăng xuất:** Gọi `POST /api/auth/logout` để xóa refresh token

---

## Notes

1. **UserId tự động:** Nhiều API tự động lấy `userId` từ JWT token, không cần truyền trong request body
2. **File upload:** Sử dụng Storage APIs để upload file, sau đó dùng `objectName` hoặc `publicUrl` trong các API khác
3. **Roles:** 
   - `Admin`: Quyền cao nhất, có thể quản lý tất cả
   - `Instructor`: Quản lý courses, lectures, tests, assignments
   - `Student`: Xem và học courses, làm tests, nộp assignments
4. **DateTime format:** ISO 8601 format (UTC): `2024-01-01T00:00:00Z`
5. **Null values:** Các trường có thể null được đánh dấu bằng `| null` trong documentation

---

## Contact

Nếu có câu hỏi hoặc cần hỗ trợ, vui lòng liên hệ team Backend.
