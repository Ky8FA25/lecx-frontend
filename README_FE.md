# README - Instructor UI Documentation

Tài liệu chi tiết về UI của các trang Instructor để hỗ trợ migration từ .NET sang Angular.

## Mục lục

1. [Tổng quan](#tổng-quan)
2. [Cấu trúc Routing](#cấu-trúc-routing)
3. [Layout và Navigation](#layout-và-navigation)
4. [Các Trang Instructor](#các-trang-instructor)
   - [Dashboard](#dashboard)
   - [My Courses](#my-courses)
   - [Course Dashboard](#course-dashboard)
   - [Lecture Detail](#lecture-detail)
   - [Material List](#material-list)
   - [Test Management](#test-management)
   - [Question Management](#question-management)
   - [Assignment Management](#assignment-management)
   - [Live Stream Management](#live-stream-management)
5. [Components và UI Elements](#components-và-ui-elements)
6. [Models và ViewModels](#models-và-viewmodels)
7. [Form Validation](#form-validation)

---

## Tổng quan

Hệ thống Instructor được xây dựng trong **Area "Instructor"** của ứng dụng .NET MVC. Tất cả các route đều có prefix `/Instructor/` và yêu cầu quyền `[Authorize(Roles = "Instructor")]`.

### Cấu trúc thư mục

```
Areas/Instructor/
├── Controllers/
│   ├── InstructorController.cs
│   ├── CourseController.cs
│   ├── LectureController.cs
│   ├── MaterialController.cs
│   ├── TestController.cs
│   ├── QuestionController.cs
│   ├── AssignmentController.cs
│   ├── LiveStreamController.cs
│   └── LiveStreamVideoController.cs
├── Views/
│   ├── Instructor/
│   │   └── Dashboard.cshtml
│   ├── Course/
│   │   └── MyCourse.cshtml
│   ├── Lecture/
│   │   └── LectureDetail.cshtml
│   ├── Material/
│   │   └── MaterialList.cshtml
│   ├── Test/
│   │   ├── CreateTest.cshtml
│   │   ├── EditTest.cshtml
│   │   └── ViewScoreTest.cshtml
│   ├── Question/
│   │   ├── CreateQuestion.cshtml
│   │   ├── EditQuestion.cshtml
│   │   └── ViewQuestionsToEdit.cshtml
│   ├── Assignment/
│   │   ├── ListAssignment.cshtml
│   │   ├── EditAssignment.cshtml
│   │   └── ViewSubmissonPdf.cshtml
│   └── LiveStream/
│       ├── SeeAllLive.cshtml
│       └── Details.cshtml
└── Models/
    └── ViewModel/
```

---

## Cấu trúc Routing

### Base Route Prefix
- Tất cả routes: `/Instructor/[Controller]/[Action]`

### Chi tiết Routes

| Controller | Action | Route | Method | Mô tả |
|------------|--------|-------|--------|-------|
| Instructor | Dashboard | `/Instructor/Instructor/Dashboard?CourseID={id}` | GET | Dashboard của course |
| Course | MyCourse | `/Instructor/Course/MyCourse` | GET | Danh sách courses của instructor |
| Course | Create | `/Instructor/Course/Create` | POST | Tạo course mới |
| Course | Update | `/Instructor/Course/Update` | POST | Cập nhật course |
| Course | Delete | `/Instructor/Course/Delete` | POST | Xóa course |
| Course | SetSate | `/Instructor/Course/SetSate` | POST | Bật/tắt course |
| Lecture | LectureDetail | `/Instructor/Lecture/LectureDetail?LectureID={id}` | GET | Chi tiết lecture |
| Lecture | Create | `/Instructor/Lecture/Create` | POST | Tạo lecture |
| Lecture | Update | `/Instructor/Lecture/Update` | POST | Cập nhật lecture |
| Lecture | Delete | `/Instructor/Lecture/Delete` | POST | Xóa lecture |
| Lecture | UploadLectureFile | `/Instructor/Lecture/UploadLectureFile` | POST | Upload file tài liệu |
| Lecture | UploadLectureVideo | `/Instructor/Lecture/UploadLectureVideo` | POST | Upload video lecture |
| Lecture | DeleteLectureFile | `/Instructor/Lecture/DeleteLectureFile` | POST | Xóa file |
| Lecture | GoNext | `/Instructor/Lecture/GoNext?lectureID={id}` | GET | Lecture tiếp theo |
| Lecture | GoPrevious | `/Instructor/Lecture/GoPrevious?lectureID={id}` | GET | Lecture trước |
| Material | MaterialList | `/Instructor/Material/MaterialList?courseID={id}` | GET | Danh sách materials |
| Material | AddMaterial | `/Instructor/Material/AddMaterial` | POST | Thêm material |
| Material | DeleteMaterial | `/Instructor/Material/DeleteMaterial` | POST | Xóa material |
| Test | CreateTest | `/Instructor/Test/CreateTest?CourseID={id}` | GET | Form tạo test |
| Test | CreateTest | `/Instructor/Test/CreateTest` | POST | Tạo test |
| Test | EditTest | `/Instructor/Test/EditTest?TestID={id}` | GET | Form sửa test |
| Test | EditTest | `/Instructor/Test/EditTest` | POST | Cập nhật test |
| Test | DeleteTest | `/Instructor/Test/DeleteTest` | POST | Xóa test |
| Test | ViewScoreTest | `/Instructor/Test/ViewScoreTest?TestID={id}` | GET | Xem điểm test |
| Test | ClearAllQuestions | `/Instructor/Test/ClearAllQuestions` | POST | Xóa tất cả câu hỏi |
| Test | ClearAllSubmission | `/Instructor/Test/ClearAllSubmission` | POST | Xóa tất cả submissions |
| Question | CreateQuestionRedirector | `/Instructor/Question/CreateQuestionRedirector?TestID={id}` | GET | Trang tạo câu hỏi |
| Question | CreateQuestion | `/Instructor/Question/CreateQuestion` | POST | Tạo câu hỏi |
| Question | EditQuestionRedirector | `/Instructor/Question/EditQuestionRedirector?TestID={id}` | GET | Danh sách câu hỏi để sửa |
| Question | EditQuestion | `/Instructor/Question/EditQuestion?QuestionID={id}&TestID={id}` | GET | Form sửa câu hỏi |
| Question | EditQuestion | `/Instructor/Question/EditQuestion` | POST | Cập nhật câu hỏi |
| Question | DeleteQuestion | `/Instructor/Question/DeleteQuestion` | POST | Xóa câu hỏi |
| Question | ImportExcel | `/Instructor/Question/ImportExcel` | POST | Import câu hỏi từ Excel |
| Question | ImportCSV | `/Instructor/Question/ImportCSV` | POST | Import câu hỏi từ CSV |
| Assignment | ListAssignment | `/Instructor/Assignment/ListAssignment?id={id}` | GET | Danh sách submissions |
| Assignment | CreateAssignment | `/Instructor/Assignment/CreateAssignment` | POST | Tạo assignment |
| Assignment | EditAssignment | `/Instructor/Assignment/EditAssignment?id={id}` | GET | Form sửa assignment |
| Assignment | EditAssignment | `/Instructor/Assignment/EditAssignment` | POST | Cập nhật assignment |
| Assignment | DeleteAssignmentConfirmed | `/Instructor/Assignment/DeleteAssignmentConfirmed?id={id}` | POST | Xóa assignment |
| Assignment | Score | `/Instructor/Assignment/Score` | POST | Chấm điểm assignment |
| LiveStream | SeeAllLive | `/Instructor/Live-streams/LiveStream/SeeAllLive/{CourseID}` | GET | Danh sách livestream |
| LiveStream | Details | `/Instructor/Live-streams/LiveStream/Details/{liveStreamId}` | GET | Chi tiết livestream |
| LiveStream | CreateLiveStream | `/Instructor/Live-streams/LiveStream/CreateLiveStream` | POST | Tạo livestream |
| LiveStream | UpdateLiveStream | `/Instructor/Live-streams/LiveStream/UpdateLiveStream` | POST | Cập nhật livestream |
| LiveStream | DeleteLiveStream | `/Instructor/Live-streams/LiveStream/DeleteLiveStream` | POST | Xóa livestream |
| LiveStream | UploadThumbnail | `/Instructor/Live-streams/LiveStream/UploadThumbnail` | POST | Upload thumbnail |
| LiveStream | DeleteThumbnail | `/Instructor/Live-streams/LiveStream/DeleteThumbnail` | POST | Xóa thumbnail |
| LiveStream | CompleteLiveStream | `/Instructor/Live-streams/LiveStream/CompleteLiveStream` | POST | Kết thúc livestream |
| LiveStreamVideo | SeeAllLivedVideo | `/Instructor/Lived-videos/LiveStreamVideo/SeeAllLivedVideo/{CourseID}` | GET | Xem tất cả video đã livestream |
| LiveStreamVideo | DeleteVideoObject | `/Instructor/Lived-videos/LiveStreamVideo/DeleteVideoObject` | POST | Xóa video |

---

## Layout và Navigation

### Layout Files

1. **`_CourseLayout.cshtml`** - Layout chính cho các trang trong course
   - Sidebar navigation với menu trái
   - Top navigation bar
   - Notification partial
   - Main content area

2. **`_Layout.cshtml`** - Layout chung cho các trang ngoài course
   - Header với navigation
   - Footer
   - Search bar
   - User menu dropdown

### Sidebar Navigation (Course Layout)

Các menu items hiển thị khi instructor vào course:

1. **Dashboard** (chỉ instructor)
   - Icon: `fas fa-fw fa-tachometer-alt`
   - Route: `Dashboard` controller `Instructor`
   - Hiển thị thống kê course

2. **Lectures**
   - Icon: `fas fa-fw fa-book`
   - Route: `LectureList` trong `Participation` controller

3. **Materials**
   - Icon: `fas fa-fw fa-file`
   - Route: `MaterialList` controller `Material`

4. **Tests**
   - Icon: `fas fa-clipboard-list`
   - Route: `TestList` controller `Participation`

5. **Assignments**
   - Icon: `fas fa-tasks`
   - Route: `AssignmentList` controller `Participation`

6. **Live Stream**
   - Icon: (cần kiểm tra)
   - Route: `Livestream` controller `Participation`

### Notification System

- Partial view: `_NoficationPartial.cshtml`
- Hiển thị TempData messages:
  - `TempData["success"]` - Thành công (màu xanh)
  - `TempData["error"]` - Lỗi (màu đỏ)
  - `TempData["warning"]` - Cảnh báo (màu vàng)
  - `TempData["info"]` - Thông tin (màu xanh nhạt)

---

## Các Trang Instructor

### Dashboard

**Route:** `/Instructor/Instructor/Dashboard?CourseID={id}`  
**Layout:** `_CourseLayout.cshtml`  
**Model:** `DashBoardViewModel`

#### UI Components

1. **Page Heading**
   - Title: "Dashboard"
   - H1 với class `h3 mb-0 text-gray-800`

2. **Statistics Cards (4 cards in row)**

   **Card 1: Total Earnings**
   - Border color: `border-left-primary`
   - Icon: `fas fa-calendar fa-2x text-gray-300`
   - Label: "Total Earnings"
   - Value: `Model.EarningMonth.ToString("N0") VND`
   - Display: `h5 mb-0 font-weight-bold text-gray-800`

   **Card 2: Earnings (Week)**
   - Border color: `border-left-success`
   - Icon: `fas fa-dollar-sign fa-2x text-gray-300`
   - Label: "Earnings (Week)"
   - Value: `Model.EarningDay.ToString("N0") VND`

   **Card 3: Number Student**
   - Border color: `border-left-info`
   - Icon: `fas fa-clipboard-list fa-2x text-gray-300`
   - Label: "Number Student"
   - Value: `Model.NumStudent`
   - Progress bar (50% width)

   **Card 4: Rating**
   - Border color: `border-left-warning`
   - Icon: `fas fa-comments fa-2x text-gray-300`
   - Label: "Rating"
   - Value: `Model.Rating`

3. **Student List Table**
   - Card với shadow
   - Header: "Student"
   - Table với DataTables (id: `dataTable`)
   - Columns:
     - Username (link to profile)
     - Student Name (link to profile)
     - Progress
     - Enroll Date (format: `yyyy-MM-dd HH:mm`)

#### Data Model

```typescript
interface DashBoardViewModel {
  EarningMonth: number;  // Total earnings
  EarningDay: number;    // Weekly earnings
  NumStudent: number;    // Number of enrolled students
  Rating: number;        // Course rating
  ListStudent: StudentCourse[];  // List of enrolled students
}
```

---

### My Courses

**Route:** `/Instructor/Course/MyCourse?category={id}&level={level}&page={page}`  
**Layout:** `_Layout.cshtml`  
**Model:** `ListViewModel`

#### UI Components

1. **Header Section**
   - Breadcrumb: Homepage > My Courses
   - Title: "My Courses" (white text)
   - Background: Header section với background image

2. **Filter Section**
   - Button: "Create new course" (opens modal)
   - Category Filter: Dropdown select
   - Level Filter: Dropdown select (All Level, Beginner, Intermediate, Advanced)

3. **Course Cards**

   Mỗi course hiển thị:
   - **Course Image:** 2 columns (col-md-2)
     - Image từ `course.CoverImagePath`
     - Class: `custom-block-image rounded img-fluid`
   
   - **Course Info:** 9 columns (col-md-9)
     - Title với status dot (đỏ nếu active, xám nếu inactive)
     - Level badge
     - Instructor name
     - Button: "Go to course"
   
   - **Action Menu:** 1 column (col-md-1)
     - Dropdown menu với 3 dots icon
     - Options:
       - Course Detail
       - Update Course (modal)
       - Enable/Disable Course (modal)
       - Delete Course (chỉ khi disabled, modal)

4. **Modals**

   **Create Course Modal** (`#createCourseModal`)
   - Form fields:
     - Course Code (text, required)
     - Course Title (text, required)
     - Description (textarea, min 20 chars, required)
     - Cover Image (file, accept images)
     - Category (select, required)
     - Level (select: beginner/intermediate/advanced, required)
     - Price (number, min 0, step 0.01, required)
     - Course Materials (file, accept .pdf,.doc,.docx,.ppt,.pptx, multiple, required)
   - Submit: POST to `/Instructor/Course/Create`

   **Update Course Modal** (`#updateCourseModal-{courseID}`)
   - Hiển thị current cover image
   - Tất cả fields như Create modal, pre-filled
   - Submit: POST to `/Instructor/Course/Update`

   **Enable/Disable Course Modal** (`#setSatateCourseModal-{courseID}`)
   - Confirmation message
   - Submit: POST to `/Instructor/Course/SetSate`

   **Delete Course Modal** (`#deleteCourseModal-{courseID}`)
   - Warning: "You can only delete a course after 30 days of deactivation"
   - Submit: POST to `/Instructor/Course/Delete`

5. **Pagination**
   - Hiển thị khi `TotalPage > 1`
   - Previous/Next buttons
   - Page numbers (max 5 visible, centered)
   - Active page highlighted

#### Data Model

```typescript
interface ListViewModel {
  Courses: Course[];
  TotalPage: number;
  CurrentPage: number;
  Category?: number;
  Level?: string;
  Categories?: Category[];
}
```

---

### Course Dashboard

**Route:** `/Instructor/Instructor/Dashboard?CourseID={id}`  
Giống với Dashboard section ở trên.

---

### Lecture Detail

**Route:** `/Instructor/Lecture/LectureDetail?LectureID={id}`  
**Layout:** `_CourseLayout.cshtml`  
**Model:** `List<LectureFileModel>`

#### UI Components

1. **Page Header**
   - Title: Lecture title với settings dropdown
   - Description paragraph
   - Settings menu:
     - Update Lecture (modal)
     - Delete Lecture (modal)

2. **Main Content Area (2 columns)**

   **Left Column (col-xl-8):**

   a. **Video Section (Card)**
      - Card header với video info
      - Video player (HTML5 `<video>` tag)
      - Button: "Change Lecture Video" / "Upload Lecture Video"
      - Delete video button (trash icon)
   
   b. **Documents Section**
      - Title: "Documents" với add icon
      - List documents với file icons theo extension:
        - PDF: `fas fa-file-pdf text-danger`
        - PPTX: `fas fa-file-powerpoint text-warning`
        - DOCX: `fas fa-file-word text-primary`
        - XLSX: `fas fa-file-excel text-success`
      - Mỗi file có link để download và delete button
   
   c. **Navigation Buttons**
      - Previous Lecture button
      - Next Lecture button

   **Right Column (col-xl-4):**

   a. **Discussion Card**
      - Header: "Discussion"
      - Comment list (scrollable, height: 400px)
      - Comment form ở bottom:
        - File upload button (icon)
        - Textarea (placeholder: "Write your comment")
        - Send button (icon)

3. **Modals**

   **Upload Video Modal** (`#uploadVideoModal`)
   - File input (accept: .mp4,.avi,.mov,.wmv, required)
   - Submit: POST to `/Instructor/Lecture/UploadLectureVideo`

   **Upload Document Modal** (`#uploadModal`)
   - File input (accept: .pdf,.doc,.docx,.ppt,.pptx,.xlsx, multiple, required)
   - Submit: POST to `/Instructor/Lecture/UploadLectureFile`

   **Update Lecture Modal** (`#updateLectureModal`)
   - Title (text, required)
   - Description (textarea)
   - Submit: POST to `/Instructor/Lecture/Update`

   **Delete Lecture Modal** (`#deleteLectureModal`)
   - Confirmation message
   - Submit: POST to `/Instructor/Lecture/Delete`

#### Data Model

```typescript
interface LectureFileModel {
  FileID: number;
  LectureID: number;
  FilePath: string;
  FileName: string;
  FileType: "Video" | "Document";
  fileExtension: string;
}
```

---

### Material List

**Route:** `/Instructor/Material/MaterialList?courseID={id}`  
**Layout:** `_CourseLayout.cshtml`  
**Model:** `List<CourseMaterialModel>`

#### UI Components

1. **Page Header**
   - Title: "Material"
   - Button: "Add Material" (opens modal)

2. **Material Cards**

   Mỗi material hiển thị trong card:
   - File icon (theo extension, tương tự Lecture)
   - File name (link để download)
   - Delete button

3. **Empty State**
   - Message: "No materials available"
   - Centered, height: 60vh

4. **Add Material Modal** (`#addMaterialModal`)
   - File input (accept: .pdf,.doc,.docx,.ppt,.pptx,.xlsx, multiple)
   - Submit: POST to `/Instructor/Material/AddMaterial`

5. **Delete Material Modal** (`#deleteMaterialModal`)
   - Confirmation message
   - Submit: POST to `/Instructor/Material/DeleteMaterial`

#### Data Model

```typescript
interface CourseMaterialModel {
  MaterialID: number;
  CourseID: number;
  MaterialsLink: string;
  FIleName: string;
  fileExtension: string;
}
```

---

### Test Management

#### Create Test

**Route:** `/Instructor/Test/CreateTest?CourseID={id}`  
**Layout:** `_CourseLayout.cshtml`  
**Model:** `CreateTestViewModel`

##### UI Components

1. **Form Fields:**
   - Test Title (text, required)
   - Description (textarea, required)
   - Start Date (datetime-local, required)
   - Test Duration:
     - Hours (number, min 0, max 24, step 1)
     - Minutes (number, min 0, max 60, step 1)
   - End Date (datetime-local, required)
   - Passing Score (number, step 0.01, min 1, placeholder: "Default is 5")
   - Allow Redo (select: Yes/No, required)
   - Number Of Max Attempt (number, min 1, placeholder: "Default is 1", chỉ hiển thị khi Allow Redo = "Yes")
   - Status (select: Active/Inactive, required)
   - Hidden: CourseID

2. **JavaScript:**
   - File: `~/js/CreateTest.js`
   - Function: `validateDates()` - Validate start/end dates
   - Show/hide "Number Of Max Attempt" field based on "Allow Redo"

3. **CSS:**
   - File: `~/css/CreateTest.css`

##### Data Model

```typescript
interface CreateTestViewModel {
  CourseID: number;
  Title: string;
  Description: string;
  StartTime: Date;
  EndTime: Date;
  TestHours: number;
  TestMinutes: number;
  PassingScore?: number;  // Default: 5.0
  AlowRedo?: string;      // "Yes" | "No", Default: "Yes"
  NumberOfMaxAttempt?: number;  // Default: 1
  Status: string;  // "Active" | "Inactive"
}
```

#### Edit Test

**Route:** `/Instructor/Test/EditTest?TestID={id}`  
**Layout:** `_CourseLayout.cshtml`  
**Model:** `EditTestViewModel`

##### UI Components

- Tương tự Create Test form
- Thêm button "Back" link về TestList
- Pre-filled với data hiện tại
- Hidden fields: NumberOfQuestion, CourseID, Course, TestID

##### Data Model

```typescript
interface EditTestViewModel extends CreateTestViewModel {
  TestID: number;
  NumberOfQuestion: number;
  Course: CourseModel;
}
```

#### View Score Test

**Route:** `/Instructor/Test/ViewScoreTest?TestID={id}&page={page}`  
**Layout:** `_CourseLayout.cshtml`  
**Model:** `ScoreListViewModel`

##### UI Components

1. **Score Table**
   - Pagination: 20 items per page
   - Columns:
     - Student info (name, username)
     - Score
     - Number of Attempt
     - Submission Date

2. **Pagination**
   - Similar to MyCourse pagination

##### Data Model

```typescript
interface ScoreListViewModel {
  TestID: number;
  ListScore: Score[];
  CurrentPage: number;
  TotalPage: number;
}
```

---

### Question Management

#### Create Question Redirector

**Route:** `/Instructor/Question/CreateQuestionRedirector?TestID={id}`  
**Layout:** `_CourseLayout.cshtml`  
**View:** `CreateQuestion.cshtml`

##### UI Components

1. **Form Fields:**
   - Question Text (textarea, required)
   - Question Image (file, accept images, optional)
   - Answer A (text, required)
   - Answer B (text, required)
   - Answer C (text, required)
   - Answer D (text, required)
   - Correct Answer (select: A/B/C/D, required)
   - Hidden: TestID

2. **Import Options:**
   - Import from Excel button
     - File input (accept: .xlsx, .xls)
     - Checkbox: "Skip first line"
   - Import from CSV button
     - File input (accept: .csv)
     - Checkbox: "Skip first line"

3. **Question List** (if exists)
   - Hiển thị danh sách questions đã tạo
   - Button: "Finish" để quay lại

##### Import File Format

**Excel/CSV Format:**
- Column 1: Question Text
- Column 2: Answer A
- Column 3: Answer B
- Column 4: Answer C
- Column 5: Answer D
- Column 6: Correct Answer (A/B/C/D)

##### Data Model

```typescript
interface QuestionViewModel {
  QuestionID?: number;
  TestID: number;
  QuestionText: string;
  AnswerA: string;
  AnswerB: string;
  AnswerC: string;
  AnswerD: string;
  CorrectAnswer: "A" | "B" | "C" | "D";
  QuestionImage?: File;
  ImagePath?: string;
}
```

#### Edit Question Redirector

**Route:** `/Instructor/Question/EditQuestionRedirector?TestID={id}`  
**Layout:** `_CourseLayout.cshtml`  
**View:** `ViewQuestionsToEdit.cshtml`  
**Model:** `List<QuestionModel>`

##### UI Components

1. **Question List**
   - Mỗi question hiển thị:
     - Question text
     - Answer A, B, C, D
     - Correct Answer highlighted
     - Image (nếu có)
     - Edit button
     - Delete button

2. **Actions:**
   - Button: "Add New Question"
   - Button: "Back to Test"

#### Edit Question

**Route:** `/Instructor/Question/EditQuestion?QuestionID={id}&TestID={id}`  
**Layout:** `_CourseLayout.cshtml`  
**Model:** `QuestionViewModel`

##### UI Components

- Tương tự Create Question form
- Pre-filled với data hiện tại
- Current image hiển thị (nếu có)
- Upload new image để replace

---

### Assignment Management

#### List Assignment (Submissions)

**Route:** `/Instructor/Assignment/ListAssignment?id={assignmentID}&page={page}`  
**Layout:** `_CourseLayout.cshtml`  
**Model:** `AssignmentListViewModel`

##### UI Components

1. **Header**
   - Button: "Back" link về AssignmentList

2. **Submissions Table**
   - Pagination: 20 items per page
   - Columns:
     - **Student:**
       - Profile image (50x50px, rounded)
       - Name (link to profile)
       - Email (subtitle)
     - **Submit Date:**
       - Format: `dd/MM/yyyy HH:mm`
       - Color: green if on time, red if late
     - **Submissions:**
       - File name (truncate if > 60 chars)
       - Link to download PDF
     - **Scores:**
       - Number input (0-10, step 0.1)
       - Color: green if >= 5, red if < 5
       - Save button

3. **Pagination**
   - Similar format to other pages

##### Data Model

```typescript
interface AssignmentListViewModel {
  Submissions: Submission[];
  ScoreAssignments: ScoreAssignment[];
  CurrentPage: number;
  TotalPage: number;
}

interface Submission {
  SubmissionID: number;
  AssignmentID: number;
  User: AppUser;
  SubmissionDate: Date;
  SubmissionLink: string;
  FileName: string;
  Assignment: Assignment;
}

interface ScoreAssignment {
  AssignmentID: number;
  StudentID: string;
  Score: number;
}
```

#### Edit Assignment

**Route:** `/Instructor/Assignment/EditAssignment?id={id}`  
**Layout:** `_CourseLayout.cshtml`  
**Model:** `AssignmentViewModel`

##### UI Components

1. **Form Fields:**
   - Title (text, required)
   - Start Date (datetime-local, required)
   - Due Date (datetime-local, required)
   - Assignment File (file, optional - upload new file)
   - Current File Display (nếu có)

2. **Buttons:**
   - Save Changes
   - Cancel

##### Data Model

```typescript
interface AssignmentViewModel {
  AssignmentID?: number;
  CourseID: number;
  Title: string;
  StartDate: Date;
  DueDate: Date;
  AssignmentLink?: File;
  ExistedAssignmentLink?: string;
}
```

---

### Live Stream Management

#### See All Live

**Route:** `/Instructor/Live-streams/LiveStream/SeeAllLive/{CourseID}`  
**Layout:** (cần kiểm tra)  
**Model:** `SeeAllLiveViewModel`

##### UI Components

1. **Live Stream List**
   - Sắp xếp: Active streams trước, inactive sau
   - Mỗi stream hiển thị:
     - Thumbnail
     - Title
     - Status (broadcasting/not broadcasting)
     - Schedule Start Time
     - Schedule Duration
     - Actions:
       - View Details
       - Edit
       - Delete
       - Complete Stream
       - Upload Thumbnail

2. **Create Live Stream Button**
   - Opens modal hoặc form

##### Data Model

```typescript
interface SeeAllLiveViewModel {
  LivestreamRecords: LivestreamRecord[];
  liveStreams: LiveStream[];
}

interface LivestreamRecord {
  LivestreamId: string;
  UserID: string;
  CourseID: number;
  Title: string;
  CreateDate: Date;
  UpdateDate: Date;
  ScheduleStartTime: Date;
  ScheduleLiveDuration: TimeSpan;
}
```

#### Live Stream Details

**Route:** `/Instructor/Live-streams/LiveStream/Details/{liveStreamId}`  
**Layout:** (cần kiểm tra)

##### UI Components

1. **Stream Info:**
   - Stream key
   - RTMP URL
   - HLS URL
   - Player embed code
   - Thumbnail

2. **Actions:**
   - Start streaming
   - Update settings
   - Upload thumbnail
   - Delete thumbnail
   - Complete stream

#### Create Live Stream

**Route:** `/Instructor/Live-streams/LiveStream/CreateLiveStream` (POST)

##### Form Data

- Title (text, required)
- Schedule Start Time (datetime-local, required)
- Schedule Duration (time, format: HH:mm, required)
- CourseID (hidden)

---

### Live Stream Video Management

#### See All Lived Video

**Route:** `/Instructor/Lived-videos/LiveStreamVideo/SeeAllLivedVideo/{CourseID}`  
**Layout:** (cần kiểm tra)

##### UI Components

1. **Video Groups by Livestream**
   - Grouped by livestream title
   - Mỗi video hiển thị:
     - Thumbnail
     - Title
     - Duration
     - Created date
     - Delete button

---

## Components và UI Elements

### Common UI Patterns

1. **Cards**
   - Class: `card shadow mb-4` hoặc `custom-block bg-white shadow-lg`
   - Header: `card-header py-3`
   - Body: `card-body`

2. **Buttons**
   - Primary: `btn custom-btn` hoặc `btn btn-info`
   - Secondary: `btn custom-btn active`
   - Danger: `btn btn-danger` hoặc `btn text-danger`
   - Outline: `btn btn-outline-black`

3. **Forms**
   - Form groups: `mb-3`
   - Labels: `form-label`
   - Inputs: `form-control`
   - Selects: `form-select` hoặc `form-control`
   - Textareas: `form-control` với `rows="3"`

4. **Modals**
   - Bootstrap 5 modals
   - Structure:
     ```html
     <div class="modal fade" id="modalId">
       <div class="modal-dialog">
         <div class="modal-content">
           <div class="modal-header">
             <h5 class="modal-title">Title</h5>
             <button class="btn-close" data-bs-dismiss="modal"></button>
           </div>
           <div class="modal-body">Content</div>
           <div class="modal-footer">Actions</div>
         </div>
       </div>
     </div>
     ```

5. **Tables**
   - Class: `table table-bordered` hoặc `table table-striped table-hover`
   - Responsive: `table-responsive` wrapper
   - DataTables: `id="dataTable"`

6. **Pagination**
   - Bootstrap pagination
   - Structure:
     ```html
     <nav aria-label="...">
       <ul class="pagination justify-content-center">
         <li class="page-item"><a class="page-link">Prev</a></li>
         <li class="page-item active"><a class="page-link">1</a></li>
         <li class="page-item"><a class="page-link">Next</a></li>
       </ul>
     </nav>
     ```

7. **Icons**
   - Font Awesome: `fas fa-*`
   - Bootstrap Icons: `bi bi-*`
   - Common icons:
     - Dashboard: `fas fa-tachometer-alt`
     - Book: `fas fa-book`
     - File: `fas fa-file`
     - Settings: `fas fa-cog`
     - Delete: `bi bi-trash-fill`
     - Edit: `bi bi-pencil`
     - Plus: `bi bi-plus-circle`

8. **File Icons**
   - PDF: `fas fa-file-pdf text-danger`
   - PPTX: `fas fa-file-powerpoint text-warning`
   - DOCX: `fas fa-file-word text-primary`
   - XLSX: `fas fa-file-excel text-success`

9. **Status Indicators**
   - Active course: Red dot `text-danger`
   - Inactive course: Gray dot `text-muted`
   - Progress bars: `progress progress-sm` với `progress-bar`

10. **Breadcrumbs**
    - Bootstrap breadcrumb
    - Structure:
      ```html
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="#">Homepage</a></li>
          <li class="breadcrumb-item active">Current Page</li>
        </ol>
      </nav>
      ```

---

## Models và ViewModels

### Core Models

```typescript
// Course Models
interface CourseModel {
  CourseID: number;
  Title: string;
  Description: string;
  CourseCode: string;
  CategoryID: number;
  Level: "beginner" | "intermediate" | "advanced";
  Price: number;
  CoverImagePath: string;
  InstructorID: string;
  CreateDate: Date;
  LastUpdate: Date;
  Status: boolean;
  IsBaned: boolean;
  Rating: number;
  NumberOfRate: number;
  NumberOfStudents: number;
  EndDate: Date;
}

// Lecture Models
interface LectureModel {
  LectureID: number;
  CourseID: number;
  Title: string;
  Description: string;
  UpLoadDate: Date;
}

interface LectureFileModel {
  FileID: number;
  LectureID: number;
  FilePath: string;
  FileName: string;
  FileType: "Video" | "Document";
  fileExtension: string;
}

// Test Models
interface TestModel {
  TestID: number;
  CourseID: number;
  Title: string;
  Description: string;
  StartTime: Date;
  EndTime: Date;
  TestTime: TimeSpan;
  PassingScore: number;
  AlowRedo: string;
  NumberOfMaxAttempt: number;
  NumberOfQuestion: number;
  Status: string;
}

interface QuestionModel {
  QuestionID: number;
  TestID: number;
  Question: string;
  AnswerA: string;
  AnswerB: string;
  AnswerC: string;
  AnswerD: string;
  CorrectAnswer: "A" | "B" | "C" | "D";
  ImagePath?: string;
}

// Assignment Models
interface AssignmentModel {
  AssignmentID: number;
  CourseID: number;
  Title: string;
  StartDate: Date;
  DueDate: Date;
  AssignmentLink: string;
}

interface SubmissionModel {
  SubmissionID: number;
  AssignmentID: number;
  UserID: string;
  SubmissionDate: Date;
  SubmissionLink: string;
  FileName: string;
}

// Material Models
interface CourseMaterialModel {
  MaterialID: number;
  CourseID: number;
  MaterialsLink: string;
  FIleName: string;
  fileExtension: string;
}

// User Models
interface AppUser {
  Id: string;
  UserName: string;
  FirstName: string;
  LastName: string;
  Email: string;
  ProfileImagePath: string;
}

interface StudentCourse {
  StudentID: string;
  CourseID: number;
  Progress: number;
  EnrollmentDate: Date;
  AppUser: AppUser;
}
```

---

## Form Validation

### Client-side Validation

1. **Required Fields**
   - HTML5 `required` attribute
   - Bootstrap validation classes

2. **Custom Validation**
   - JavaScript functions:
     - `validateDates()` - For test start/end dates
     - Character count validation for descriptions

3. **File Validation**
   - Accept attributes:
     - Images: `accept="image/*"`
     - Videos: `accept=".mp4,.avi,.mov,.wmv"`
     - Documents: `accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx"`
   - Multiple files: `multiple` attribute

4. **Number Validation**
   - Min/Max attributes
   - Step attributes for decimals

5. **Date Validation**
   - `datetime-local` input type
   - Custom JavaScript validation

### Server-side Validation

- ModelState validation
- Error messages trong TempData
- Redirect back với errors

---

## Angular Migration Notes

### Recommended Angular Structure

```
src/app/instructor/
├── components/
│   ├── dashboard/
│   ├── course-list/
│   ├── course-form/
│   ├── lecture-detail/
│   ├── material-list/
│   ├── test-form/
│   ├── question-form/
│   ├── assignment-list/
│   └── livestream/
├── services/
│   ├── course.service.ts
│   ├── lecture.service.ts
│   ├── test.service.ts
│   ├── question.service.ts
│   ├── assignment.service.ts
│   └── livestream.service.ts
├── models/
│   └── instructor.models.ts
└── instructor-routing.module.ts
```

### Key Angular Features to Use

1. **Routing**
   - Angular Router với route guards
   - Route parameters cho IDs
   - Query parameters cho filters

2. **Forms**
   - Reactive Forms cho complex forms
   - Template-driven forms cho simple forms
   - Custom validators

3. **Components**
   - Reusable components:
     - File upload component
     - Modal component
     - Table with pagination component
     - File icon component

4. **Services**
   - HTTP client cho API calls
   - File upload service
   - Notification service (toastr/ngx-toastr)

5. **State Management**
   - Services với RxJS BehaviorSubject
   - hoặc NgRx nếu cần

6. **UI Libraries**
   - Angular Material
   - PrimeNG
   - hoặc Bootstrap with ng-bootstrap

### Migration Checklist

- [ ] Setup Angular project structure
- [ ] Create routing module
- [ ] Setup authentication guards
- [ ] Create models/interfaces
- [ ] Create services for API calls
- [ ] Create shared components (modals, tables, file upload)
- [ ] Implement Dashboard page
- [ ] Implement My Courses page with filtering
- [ ] Implement Course form (create/update)
- [ ] Implement Lecture detail page
- [ ] Implement Material list page
- [ ] Implement Test management (CRUD)
- [ ] Implement Question management (CRUD + import)
- [ ] Implement Assignment management
- [ ] Implement Live Stream management
- [ ] Add file upload functionality
- [ ] Add pagination component
- [ ] Add notification/toast system
- [ ] Add loading indicators
- [ ] Handle error states
- [ ] Add form validation
- [ ] Test all functionality

---

## API Endpoints (Expected)

Các endpoints API cần được implement trong backend:

```
GET    /api/instructor/courses
POST   /api/instructor/courses
PUT    /api/instructor/courses/{id}
DELETE /api/instructor/courses/{id}
POST   /api/instructor/courses/{id}/toggle-status

GET    /api/instructor/courses/{courseId}/dashboard
GET    /api/instructor/courses/{courseId}/students

GET    /api/instructor/courses/{courseId}/lectures/{lectureId}
POST   /api/instructor/courses/{courseId}/lectures
PUT    /api/instructor/lectures/{id}
DELETE /api/instructor/lectures/{id}
POST   /api/instructor/lectures/{id}/files
POST   /api/instructor/lectures/{id}/video
DELETE /api/instructor/lecture-files/{id}

GET    /api/instructor/courses/{courseId}/materials
POST   /api/instructor/courses/{courseId}/materials
DELETE /api/instructor/materials/{id}

GET    /api/instructor/courses/{courseId}/tests
POST   /api/instructor/courses/{courseId}/tests
PUT    /api/instructor/tests/{id}
DELETE /api/instructor/tests/{id}
GET    /api/instructor/tests/{id}/scores

GET    /api/instructor/tests/{testId}/questions
POST   /api/instructor/tests/{testId}/questions
PUT    /api/instructor/questions/{id}
DELETE /api/instructor/questions/{id}
POST   /api/instructor/tests/{testId}/questions/import-excel
POST   /api/instructor/tests/{testId}/questions/import-csv

GET    /api/instructor/assignments/{id}/submissions
POST   /api/instructor/assignments/{id}/score

GET    /api/instructor/courses/{courseId}/livestreams
POST   /api/instructor/courses/{courseId}/livestreams
PUT    /api/instructor/livestreams/{id}
DELETE /api/instructor/livestreams/{id}
POST   /api/instructor/livestreams/{id}/thumbnail
DELETE /api/instructor/livestreams/{id}/thumbnail
POST   /api/instructor/livestreams/{id}/complete
```

---

## Notes và Best Practices

1. **File Upload**
   - Sử dụng FormData cho file uploads
   - Show progress indicator
   - Validate file types và sizes

2. **Pagination**
   - Implement server-side pagination
   - Show loading state
   - Handle empty states

3. **Forms**
   - Disable submit button khi submitting
   - Show validation errors inline
   - Auto-save drafts nếu cần

4. **Notifications**
   - Success messages
   - Error messages
   - Warning messages
   - Auto-dismiss sau vài giây

5. **Performance**
   - Lazy load modules
   - Virtual scrolling cho long lists
   - Image optimization

6. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support

---

## Liên hệ và Hỗ trợ

Để biết thêm chi tiết về migration, vui lòng tham khảo:
- Angular Documentation: https://angular.io/docs
- Angular Material: https://material.angular.io
- PrimeNG: https://primeng.org

---

*Document này được tạo để hỗ trợ migration từ .NET MVC sang Angular. Cập nhật cuối: [Ngày hiện tại]*

