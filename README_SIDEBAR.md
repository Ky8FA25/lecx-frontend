# README - Sidebar Documentation (Dashboard Page)

Tài liệu chi tiết về Sidebar nằm bên trái trong trang Dashboard của Instructor.

## Mục lục

1. [Tổng quan](#tổng-quan)
2. [Cấu trúc Sidebar](#cấu-trúc-sidebar)
3. [Chi tiết các Menu Items](#chi-tiết-các-menu-items)
4. [Styling và CSS Classes](#styling-và-css-classes)
5. [Logic điều kiện hiển thị](#logic-điều-kiện-hiển-thị)
6. [Angular Migration Guide](#angular-migration-guide)

---

## Tổng quan

Sidebar là thành phần navigation chính trong Course Layout (`_CourseLayout.cshtml`), hiển thị menu điều hướng bên trái màn hình cho cả Instructor và Student khi vào một course cụ thể.

### Vị trí trong Layout

- **File:** `OnlineLearning/Views/Shared/_CourseLayout.cshtml`
- **Vị trí:** Bên trong `<div id="wrapper">` 
- **Cấu trúc:** `<ul class="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion">`

### Đặc điểm

- **Responsive:** Tự động collapse trên mobile
- **Collapsible:** Có thể ẩn/hiện bằng toggle button
- **Active State:** Menu item hiện tại được highlight
- **Conditional Display:** Một số menu items chỉ hiển thị cho Instructor hoặc Student

---

## Cấu trúc Sidebar

### HTML Structure

```html
<ul class="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
  <!-- Sidebar Brand -->
  <a class="sidebar-brand">...</a>
  
  <!-- Menu Items -->
  <li class="nav-item">...</li>
  <li class="nav-item">...</li>
  ...
  
  <!-- Sidebar Divider -->
  <hr class="sidebar-divider">
  
  <!-- Sidebar Toggler -->
  <div class="text-center">
    <button id="sidebarToggle">...</button>
  </div>
</ul>
```

### Classes chính

- `navbar-nav` - Bootstrap nav class
- `bg-gradient-primary` - Background gradient màu primary
- `sidebar` - Sidebar container
- `sidebar-dark` - Dark theme cho sidebar
- `accordion` - Bootstrap accordion cho collapsible menu

---

## Chi tiết các Menu Items

### 1. Sidebar Brand (Logo/Home Link)

**Vị trí:** Đầu sidebar

```html
<a class="sidebar-brand text-dark mr-auto" asp-action="Index" asp-controller="Home">
  <i class="bi-back"></i>
  <span>LearnOn</span>
</a>
```

**Chi tiết:**
- **Icon:** Bootstrap icon `bi-back`
- **Text:** "LearnOn"
- **Link:** Trang chủ (`Home/Index`)
- **Style:** `text-dark mr-auto`
- **Chức năng:** Click để quay về trang chủ

---

### 2. Dashboard (Chỉ Instructor)

**Vị trí:** Menu item đầu tiên (chỉ hiển thị nếu user là instructor của course)

```html
<li title="Dashboard" class="nav-item [active]">
  <a class="nav-link" asp-action="Dashboard" asp-controller="Instructor" 
     asp-area="Instructor" asp-route-CourseID="@courseID">
    <i class="fas fa-fw fa-tachometer-alt"></i>
    <nav-link>Dashboard</nav-link>
  </a>
</li>
```

**Chi tiết:**
- **Icon:** Font Awesome `fas fa-tachometer-alt` (dashboard icon)
- **Text:** "Dashboard"
- **Route:** `/Instructor/Instructor/Dashboard?CourseID={courseID}`
- **Controller:** `InstructorController`
- **Action:** `Dashboard`
- **Conditional:** Chỉ hiển thị khi `currentCourse.InstructorID == user.Id`
- **Active State:** `active` class khi controller = "Instructor" và action = "Dashboard"

**Thay thế cho Student:**
- Nếu user là Student, hiển thị menu **Course Info** thay vì Dashboard

---

### 3. Course Info (Chỉ Student)

**Vị trí:** Menu item đầu tiên (chỉ hiển thị nếu user KHÔNG phải instructor)

```html
<li title="Course Info" class="nav-item [active]">
  <a class="nav-link" asp-action="CourseInfo" asp-controller="Participation" 
     asp-route-CourseID="@courseID">
    <i class="bi bi-info-circle"></i>
    <nav-link>Course Info</nav-link>
  </a>
</li>
```

**Chi tiết:**
- **Icon:** Bootstrap icon `bi-info-circle`
- **Text:** "Course Info"
- **Route:** `/Participation/CourseInfo?CourseID={courseID}`
- **Controller:** `ParticipationController`
- **Action:** `CourseInfo`
- **Conditional:** Chỉ hiển thị khi `currentCourse.InstructorID != user.Id`

---

### 4. Materials

**Vị trí:** Menu item thứ hai

```html
<li title="Materials" class="nav-item [active]">
  <a class="nav-link" asp-action="MaterialList" asp-controller="Participation" 
     asp-route-CourseID="@courseID">
    <i class="fas fa-file-alt"></i>
    <nav-link> Materials</nav-link>
  </a>
</li>
```

**Chi tiết:**
- **Icon:** Font Awesome `fas fa-file-alt`
- **Text:** "Materials"
- **Route:** `/Participation/MaterialList?CourseID={courseID}`
- **Controller:** `ParticipationController`
- **Action:** `MaterialList`
- **Access:** Hiển thị cho cả Instructor và Student
- **Active State:** Khi controller = "Material" và action = "MaterialList"

---

### 5. Lectures (Collapsible Menu)

**Vị trí:** Menu item thứ ba (có thể expand/collapse)

**Cấu trúc:**
```html
<li title="Lectures" class="nav-item [active]">
  <!-- Lecture Menu Toggle -->
  <a class="nav-link collapsed" href="#" 
     data-toggle="collapse" data-target="#lectureList"
     aria-expanded="true" aria-controls="collapseTwo">
    <i class="fas fa-book-open"></i>
    <nav-link>Lectures</nav-link>
  </a>
  
  <!-- Lecture List (Collapsible Content) -->
  <div id="lectureList" class="collapse" 
       aria-labelledby="headingTwo" data-parent="#accordionSidebar">
    <div class="bg-white py-2 collapse-inner rounded">
      
      <!-- Add Lecture Button (chỉ Instructor) -->
      @if (currentCourse.InstructorID.Equals(user.Id)) {
        <h6 class="ml-4 mt-1">
          <a class="btn btn-outline active" 
             data-bs-toggle="modal" data-bs-target="#createLectureModal">
            Add Lecture
            <i class="ml-3 fas fa-plus-circle"></i>
          </a>
        </h6>
      }
      
      <!-- Lecture List Component -->
      @Html.Partial("_SideLecture", courseID)
      
    </div>
  </div>
</li>
```

**Chi tiết:**
- **Icon:** Font Awesome `fas fa-book-open`
- **Text:** "Lectures"
- **Type:** Collapsible accordion menu
- **Toggle:** Click để expand/collapse danh sách lectures
- **Bootstrap Classes:**
  - `collapsed` - Initial state (collapsed)
  - `data-toggle="collapse"` - Bootstrap collapse trigger
  - `data-target="#lectureList"` - Target element to collapse

**Add Lecture Button (Chỉ Instructor):**
- **Icon:** Font Awesome `fas fa-plus-circle`
- **Text:** "Add Lecture"
- **Type:** Button mở modal
- **Modal:** `#createLectureModal`
- **Conditional:** Chỉ hiển thị khi `currentCourse.InstructorID == user.Id`

**Lecture List Component:**
- **Partial View:** `_SideLecture.cshtml`
- **Component:** `LectureViewComponent`
- **Model:** `IEnumerable<LectureModel>`
- **Display Format:**
  ```
  📚 Lecture 1
  [Lecture Title] (link)
  
  📚 Lecture 2
  [Lecture Title] (link)
  ...
  ```
- **Empty State:** Hiển thị "No lecture yet" nếu không có lecture

**Lecture Item Format:**
- **Icon:** Font Awesome `fas fa-graduation-cap`
- **Label:** "Lecture {index + 1}" (strong text)
- **Link:** Lecture title (truncate nếu > 200px)
- **Route:** `/Participation/LectureDetail?LectureID={lectureID}` (cho Student)
- **Route:** `/Instructor/Lecture/LectureDetail?LectureID={lectureID}` (cho Instructor - cần verify)

**Styling Lecture Items:**
```css
.collapse-item {
  display: block; 
  max-width: 200px; 
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis;
}
```

---

### 6. Grades (Chỉ Student)

**Vị trí:** Menu item thứ tư (chỉ hiển thị cho Student)

```html
@if (!currentCourse.InstructorID.Equals(user.Id)) {
  <li title="Grades" class="nav-item [active]">
    <a class="nav-link" asp-action="GradeList" asp-controller="Student" 
       asp-area="Student" asp-route-CourseID="@courseID">
      <i class="fas fa-clipboard"></i>
      <nav-link>Grades</nav-link>
    </a>
  </li>
}
```

**Chi tiết:**
- **Icon:** Font Awesome `fas fa-clipboard`
- **Text:** "Grades"
- **Route:** `/Student/Student/GradeList?CourseID={courseID}`
- **Controller:** `StudentController` (Area: Student)
- **Action:** `GradeList`
- **Conditional:** Chỉ hiển thị khi `currentCourse.InstructorID != user.Id`
- **Active State:** Khi controller = "Student" và action = "Grades"

---

### 7. Tests

**Vị trí:** Menu item tiếp theo

```html
<li title="Tests" class="nav-item [active]">
  <a class="nav-link" asp-action="TestList" asp-controller="Participation" 
     asp-route-CourseID="@courseID">
    <i class="fas fa-clipboard-list"></i>
    <nav-link>Tests</nav-link>
  </a>
</li>
```

**Chi tiết:**
- **Icon:** Font Awesome `fas fa-clipboard-list`
- **Text:** "Tests"
- **Route:** `/Participation/TestList?CourseID={courseID}`
- **Controller:** `ParticipationController`
- **Action:** `TestList`
- **Access:** Hiển thị cho cả Instructor và Student
- **Active State:** Khi controller = "Participation" và action = "TestList"

---

### 8. Assignments

**Vị trí:** Menu item tiếp theo

```html
<li title="Assignments" class="nav-item [active]">
  <a class="nav-link" asp-action="AssignmentList" asp-controller="Participation" 
     asp-route-CourseID="@courseID">
    <i class="fas fa-tasks"></i>
    <nav-link>Assignments</nav-link>
  </a>
</li>
```

**Chi tiết:**
- **Icon:** Font Awesome `fas fa-tasks`
- **Text:** "Assignments"
- **Route:** `/Participation/AssignmentList?CourseID={courseID}`
- **Controller:** `ParticipationController`
- **Action:** `AssignmentList`
- **Access:** Hiển thị cho cả Instructor và Student
- **Active State:** Khi controller = "Participation" và action = "AssignmentList"

---

### 9. Live Stream

**Vị trí:** Menu item cuối cùng

```html
<li title="Live stream" class="nav-item [active]">
  <a class="nav-link" asp-action="Livestream" asp-controller="Participation" 
     asp-route-CourseID="@courseID">
    <i class="bi bi-broadcast"></i>
    <nav-link>Live stream</nav-link>
  </a>
</li>
```

**Chi tiết:**
- **Icon:** Bootstrap icon `bi-broadcast`
- **Text:** "Live stream"
- **Route:** `/Participation/Livestream?CourseID={courseID}`
- **Controller:** `ParticipationController`
- **Action:** `Livestream`
- **Access:** Hiển thị cho cả Instructor và Student
- **Active State:** Khi controller = "Participation" và action = "Livestream"

---

### 10. Sidebar Divider

**Vị trí:** Sau các menu items, trước toggle button

```html
<hr class="sidebar-divider d-none d-md-block">
```

**Chi tiết:**
- **Class:** `sidebar-divider` - Tạo đường kẻ ngang
- **Responsive:** `d-none d-md-block` - Ẩn trên mobile, hiện từ medium screen trở lên

---

### 11. Sidebar Toggler

**Vị trí:** Cuối sidebar

```html
<div class="text-center d-none d-md-inline">
  <button class="rounded-circle border-0" id="sidebarToggle"></button>
</div>
```

**Chi tiết:**
- **ID:** `sidebarToggle`
- **Type:** Button tròn để toggle sidebar
- **Responsive:** `d-none d-md-inline` - Ẩn trên mobile, hiện từ medium screen trở lên
- **JavaScript:** Xử lý bởi `sb-admin-2.js`

---

## Styling và CSS Classes

### CSS Files

1. **`~/css/sb-admin-2.css`** - Main sidebar styling
2. **`~/course/css/sb-admin-2.css`** - Additional styling
3. **`~/css/bootstrap.min.css`** - Bootstrap base styles

### Key CSS Classes

#### Sidebar Container
```css
.sidebar {
  /* Sidebar container styles */
}

.sidebar-dark {
  /* Dark theme styles */
}

.bg-gradient-primary {
  /* Primary gradient background */
}
```

#### Menu Items
```css
.nav-item {
  /* Base nav item styles */
}

.nav-item.active {
  /* Active menu item styles */
}

.nav-link {
  /* Menu link styles */
}

.nav-link:hover {
  /* Hover state */
}
```

#### Collapsible Content
```css
.collapse {
  /* Collapsed state */
}

.collapse.show {
  /* Expanded state */
}

.collapse-inner {
  /* Inner content of collapsible menu */
  background: white;
  padding: 0.5rem 0;
  border-radius: 4px;
}

.collapse-header {
  /* Header in collapse content */
}

.collapse-item {
  /* Items in collapse (lecture list) */
  display: block;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

#### Icons
```css
.fas {
  /* Font Awesome icons */
  font-size: 1rem;
  width: 1.5rem;
}

.bi {
  /* Bootstrap Icons */
}
```

---

## Logic điều kiện hiển thị

### Kiểm tra User Role

```csharp
// Trong _CourseLayout.cshtml
var currentCourse = ViewBag.Course as CourseModel;
var user = await UserManager.GetUserAsync(User);

// Kiểm tra nếu user là instructor của course
if (currentCourse.InstructorID.Equals(user.Id)) {
  // Hiển thị Dashboard
  // Hiển thị "Add Lecture" button
  // Ẩn Grades menu
} else {
  // Hiển thị Course Info
  // Ẩn "Add Lecture" button
  // Hiển thị Grades menu
}
```

### Active State Logic

```csharp
// Kiểm tra active state cho từng menu item
var controller = ViewContext.RouteData.Values["controller"].ToString();
var action = ViewContext.RouteData.Values["action"].ToString();

// Example: Dashboard active
@if (controller == "Instructor" && action == "Dashboard") {
  <li class="nav-item active">...</li>
} else {
  <li class="nav-item">...</li>
}
```

### Menu Items hiển thị theo Role

| Menu Item | Instructor | Student |
|-----------|-----------|---------|
| Dashboard | ✅ | ❌ |
| Course Info | ❌ | ✅ |
| Materials | ✅ | ✅ |
| Lectures | ✅ | ✅ |
| Grades | ❌ | ✅ |
| Tests | ✅ | ✅ |
| Assignments | ✅ | ✅ |
| Live Stream | ✅ | ✅ |

---

## Chi tiết Lecture List Component

### Component Structure

**Partial View:** `_SideLecture.cshtml`
```html
@model int  <!-- courseID -->
<div class="container-fluid">
  @await Component.InvokeAsync("Lecture", new { courseId = Model })
</div>
```

**View Component:** `LectureViewComponent`
- **Location:** `OnlineLearning/Resporitories/Components/LectureViewComponent.cs`
- **View:** `Views/Shared/Components/Lecture/Default.cshtml`
- **Model:** `IEnumerable<LectureModel>`

### Lecture List Rendering

**Default.cshtml Structure:**
```html
@model IEnumerable<LectureModel>

@if (Model == null || !Model.Any()) {
  <h6 class="collapse-header mt-2 mb-2">No lecture yet</h6>
} else {
  <div class="mt-2">
    @for (int index = 0; index < Model.Count(); index++) {
      var lecture = Model.ElementAt(index);
      
      <strong>
        <i class="fas fa-graduation-cap mr-1"></i>
        Lecture @(index + 1)
      </strong>
      <br />
      <a asp-action="LectureDetail" 
         asp-controller="Participation" 
         asp-route-LectureID="@lecture.LectureID" 
         class="collapse-item" 
         title="@lecture.Title">
        @lecture.Title
      </a>
    }
  </div>
}
```

### Lecture Item Format

- **Number:** "Lecture 1", "Lecture 2", ...
- **Icon:** `fas fa-graduation-cap` (graduation cap)
- **Title:** Full lecture title (truncated nếu dài)
- **Link:** Click để vào LectureDetail
- **Truncation:** Max width 200px, ellipsis nếu overflow

---

## Create Lecture Modal

**Modal ID:** `#createLectureModal`

**Trigger:** Button "Add Lecture" trong Lectures collapse menu (chỉ Instructor)

**Form Fields:**
- **CourseID** (hidden, required)
- **Title** (text, required)
- **Description** (textarea, optional)
- **LectureFile** (file, accept: .pdf,.doc,.docx,.ppt,.pptx,.xlsx, multiple)
- **VideoFile** (file, accept: .mp4,.mov,.avi, optional)

**Validation:**
- Nếu có VideoFile, LectureFile không bắt buộc
- Nếu không có VideoFile, LectureFile bắt buộc

**Submit:** POST to `/Instructor/Lecture/Create`

---

## Angular Migration Guide

### Component Structure

```typescript
// sidebar.component.ts
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  courseId: number;
  isInstructor: boolean;
  lectures: Lecture[];
  currentRoute: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private authService: AuthService
  ) {}
  
  ngOnInit() {
    this.courseId = +this.route.snapshot.paramMap.get('courseId');
    this.checkUserRole();
    this.loadLectures();
    this.setActiveRoute();
  }
}
```

### Template Structure

```html
<nav class="sidebar">
  <!-- Brand -->
  <a class="sidebar-brand" routerLink="/home">
    <i class="bi bi-back"></i>
    <span>LearnOn</span>
  </a>

  <!-- Dashboard (Instructor only) -->
  <a *ngIf="isInstructor" 
     class="nav-link" 
     [routerLink]="['/instructor/dashboard', courseId]"
     [class.active]="currentRoute === 'dashboard'">
    <i class="fas fa-tachometer-alt"></i>
    <span>Dashboard</span>
  </a>

  <!-- Course Info (Student only) -->
  <a *ngIf="!isInstructor" 
     class="nav-link"
     [routerLink]="['/participation/course-info', courseId]"
     [class.active]="currentRoute === 'course-info'">
    <i class="bi bi-info-circle"></i>
    <span>Course Info</span>
  </a>

  <!-- Materials -->
  <a class="nav-link"
     [routerLink]="['/participation/material-list', courseId]"
     [class.active]="currentRoute === 'material-list'">
    <i class="fas fa-file-alt"></i>
    <span>Materials</span>
  </a>

  <!-- Lectures (Collapsible) -->
  <div class="nav-item">
    <a class="nav-link" 
       (click)="toggleLectures()"
       [class.collapsed]="!lecturesExpanded">
      <i class="fas fa-book-open"></i>
      <span>Lectures</span>
    </a>
    
    <div class="collapse" [class.show]="lecturesExpanded">
      <div class="collapse-inner">
        <!-- Add Lecture Button (Instructor) -->
        <button *ngIf="isInstructor" 
                class="btn btn-outline"
                (click)="openCreateLectureModal()">
          <i class="fas fa-plus-circle"></i>
          Add Lecture
        </button>
        
        <!-- Lecture List -->
        <div *ngFor="let lecture of lectures; let i = index">
          <strong>
            <i class="fas fa-graduation-cap"></i>
            Lecture {{ i + 1 }}
          </strong>
          <a [routerLink]="['/lecture-detail', lecture.lectureID]"
             class="collapse-item"
             [title]="lecture.title">
            {{ lecture.title }}
          </a>
        </div>
        
        <div *ngIf="lectures.length === 0" class="collapse-header">
          No lecture yet
        </div>
      </div>
    </div>
  </div>

  <!-- Grades (Student only) -->
  <a *ngIf="!isInstructor"
     class="nav-link"
     [routerLink]="['/student/grades', courseId]"
     [class.active]="currentRoute === 'grades'">
    <i class="fas fa-clipboard"></i>
    <span>Grades</span>
  </a>

  <!-- Tests -->
  <a class="nav-link"
     [routerLink]="['/participation/test-list', courseId]"
     [class.active]="currentRoute === 'test-list'">
    <i class="fas fa-clipboard-list"></i>
    <span>Tests</span>
  </a>

  <!-- Assignments -->
  <a class="nav-link"
     [routerLink]="['/participation/assignment-list', courseId]"
     [class.active]="currentRoute === 'assignment-list'">
    <i class="fas fa-tasks"></i>
    <span>Assignments</span>
  </a>

  <!-- Live Stream -->
  <a class="nav-link"
     [routerLink]="['/participation/livestream', courseId]"
     [class.active]="currentRoute === 'livestream'">
    <i class="bi bi-broadcast"></i>
    <span>Live stream</span>
  </a>
</nav>
```

### Service Methods

```typescript
// course.service.ts
export class CourseService {
  checkUserRole(courseId: number, userId: string): Observable<boolean> {
    // Check if user is instructor of course
    return this.http.get<boolean>(`/api/courses/${courseId}/is-instructor/${userId}`);
  }

  getLectures(courseId: number): Observable<Lecture[]> {
    return this.http.get<Lecture[]>(`/api/courses/${courseId}/lectures`);
  }
}
```

### Models

```typescript
// lecture.model.ts
export interface Lecture {
  lectureID: number;
  courseID: number;
  title: string;
  description: string;
  uploadDate: Date;
}
```

### Styling (SCSS)

```scss
.sidebar {
  background: linear-gradient(to bottom, #4e73df, #224abe);
  min-height: 100vh;
  width: 224px;
  
  .nav-link {
    color: rgba(255, 255, 255, 0.8);
    padding: 1rem;
    
    &:hover {
      color: rgba(255, 255, 255, 1);
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    &.active {
      background-color: rgba(255, 255, 255, 0.2);
      color: white;
    }
  }
  
  .collapse-inner {
    background: white;
    padding: 0.5rem;
    border-radius: 4px;
    margin: 0.5rem;
    
    .collapse-item {
      display: block;
      max-width: 200px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #333;
      text-decoration: none;
      
      &:hover {
        color: #4e73df;
      }
    }
  }
}
```

### Routing

```typescript
// instructor-routing.module.ts
const routes: Routes = [
  {
    path: 'courses/:courseId',
    component: CourseLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'lectures/:lectureId', component: LectureDetailComponent },
      // ...
    ]
  }
];
```

---

## API Endpoints (Expected)

### Get Course Info
```
GET /api/courses/{courseId}
Response: {
  courseID: number;
  title: string;
  instructorID: string;
  // ...
}
```

### Check User Role
```
GET /api/courses/{courseId}/is-instructor/{userId}
Response: boolean
```

### Get Lectures
```
GET /api/courses/{courseId}/lectures
Response: Lecture[]
```

---

## Notes và Best Practices

1. **Active State Management:**
   - Sử dụng `routerLinkActive` directive trong Angular
   - Hoặc track current route trong component

2. **Collapsible Menu:**
   - Sử dụng Bootstrap collapse hoặc custom implementation
   - Lưu state (expanded/collapsed) nếu cần persist

3. **Responsive Design:**
   - Sidebar collapse trên mobile
   - Overlay sidebar trên small screens
   - Toggle button để show/hide

4. **Performance:**
   - Load lectures list một lần khi component init
   - Cache lecture list nếu không thay đổi thường xuyên
   - Lazy load lecture details khi click

5. **Accessibility:**
   - ARIA labels cho collapsible menus
   - Keyboard navigation support
   - Screen reader friendly

6. **Icons:**
   - Font Awesome hoặc Bootstrap Icons
   - Consistent icon sizes
   - Proper spacing

---

## Checklist Migration

- [ ] Create sidebar component
- [ ] Implement role-based menu display
- [ ] Implement active route detection
- [ ] Implement collapsible lectures menu
- [ ] Create lecture list component
- [ ] Implement "Add Lecture" modal trigger
- [ ] Add routing for all menu items
- [ ] Implement sidebar toggle (responsive)
- [ ] Add proper styling (SCSS)
- [ ] Add icons library
- [ ] Test active state highlighting
- [ ] Test role-based visibility
- [ ] Test responsive behavior
- [ ] Test keyboard navigation
- [ ] Test accessibility

---

*Document này được tạo để hỗ trợ migration sidebar từ .NET MVC sang Angular. Cập nhật cuối: [Ngày hiện tại]*

