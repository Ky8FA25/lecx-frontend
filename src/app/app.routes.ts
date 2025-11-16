import { Routes } from '@angular/router';
import { Login } from './features/auth/components/login/login';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { Register } from './features/auth/components/register/register';
import { Home } from './features/home/components/home/home';
import { authGuard } from './core/guards/auth-guard';
import { InstructorCourse } from './features/courses/components/instructor-course/instructor-course';
import { UserChangePassword } from './features/user/components/user-change-password/user-change-password';
import { EditUserProfile } from './features/user/components/edit-user-profile/edit-user-profile';
import { ForgotPassword } from './features/auth/components/forgot-password/forgot-password';
import { ResetPassword } from './features/auth/components/reset-password/reset-password';
import { SubmitAssignment } from './features/student/components/submit-assignment/submit-assignment';
import { MyCourse } from './features/student/components/my-course/my-course';
import { LectureDetail } from './features/student/components/lecture-detail/lecture-detail';
import { MaterialList } from './features/student/components/material-list/material-list';
import { GradeList } from './features/student/components/grade-list/grade-list';
import { InstructorRegistration } from './features/student/components/instructor-registration/instructor-registration';
import { DoTest } from './features/student/components/do-test/do-test';
import { UserProfile } from './features/user/components/user-profile/user-profile';
import { Mainlayout } from './layouts/main-layout/main-layout';
import { CourseLayout } from './layouts/course-layout/course-layout';
import { Coursedetail } from './features/courses/components/course-detail/course-detail';
import { Courselist } from './features/courses/components/course-list/course-list';
import { NotFound } from './features/not-found/not-found';
import { CourseInfo } from './features/student/components/course-info/course-info';
import { PaymentSuccessful } from './features/payments/components/payment-successful/payment-successful';
import { PaymentFailed } from './features/payments/components/payment-failed/payment-failed';
import { AsignmentList } from './features/student/components/asignment-list/asignment-list';
import { InstructorDashboard } from './features/instructor/components/dashboard/dashboard';
import { InstructorMyCourses } from './features/instructor/components/my-courses/my-courses';
import { InstructorLectureDetail } from './features/instructor/components/lectures/lecture-detail';
import { AssignmentList } from './features/instructor/components/assignments/assignment-list';
import { AssignmentDetail } from './features/instructor/components/assignments/assignment-detail';
import { TestList } from './features/instructor/components/tests/test-list';
import { TestDetail } from './features/instructor/components/tests/test-detail';
import { Role } from './core/enums/enums';
import { InstructorLayout } from './layouts/instructor-layout/instructor-layout';

export const routes: Routes = [
  
  {
    path: '',
    redirectTo: 'home/main',
    pathMatch: 'full'

  },
  {
    path: 'auth',
    component: AuthLayout,
    children: [
      { 
        path: 'signin', 
        component: Login 
      },
      {
        path: 'signup',
        component: Register
      },
      {
        path: 'forgot-password',
        component: ForgotPassword
      },
      {
        path: 'reset-password',
        component: ResetPassword
      }
    ]  
  },
  {
    path: 'home',
    component: Mainlayout,
    children: [
      {
        path: 'main',
        component: Home
      }
    ]
  },
  {
  path: 'courses',
  component: Mainlayout,
  children: [
    {
      path: 'detail/:courseId',
        component: Coursedetail
    },
    {
      path: 'all',
      component: Courselist
    },
    {
      path: 'list',
      component: InstructorCourse
    }
  ]
},
{
  path: 'instructor',
  component: Mainlayout,
  canActivate: [authGuard],
  data: { roles: [Role.Instructor, Role.Admin] },
  children: [
    {
      path: 'courses',
      component: InstructorMyCourses
    }
  ]
},
{
  path: 'instructor',
  component: InstructorLayout,
  canActivate: [authGuard],
  data: { roles: [Role.Instructor, Role.Admin] },
  children: [
    {
      path: 'courses/:courseId/dashboard',
      component: InstructorDashboard
    },
    {
      path: 'courses/:courseId/lectures/:lectureId',
      component: InstructorLectureDetail
    },
    {
      path: 'courses/:courseId/assignments',
      component: AssignmentList
    },
    {
      path: 'courses/:courseId/assignments/:assignmentId',
      component: AssignmentDetail
    },
    {
      path: 'courses/:courseId/tests',
      component: TestList
    },
    {
      path: 'courses/:courseId/tests/:testId',
      component: TestDetail
    }
    // Instructor course-specific routes will be added here
    // e.g., materials, etc.
  ]
},
{
  path: 'user',
  component: Mainlayout,
  canActivate: [authGuard],
  children: [
    {
      path: 'profile',
      component: UserProfile
    },
    {
      path: 'change-password',
      component: UserChangePassword
    },
    {
      path: 'edit-user',
      component: EditUserProfile
    }
  ]
},
{
  path: 'student/course/:courseID',
  component: CourseLayout,
  children: [
    {
      path: 'submit-assignment',
      component: SubmitAssignment
    },
    {
      path: 'lecture-detail',
      component: LectureDetail
    },
    {
      path: 'material-list',
      component: MaterialList
    },
    {
      path: 'grade-list',
      component: GradeList
    },
    {
       path: '',
      pathMatch: 'full',
      component: CourseInfo
    },
    {
      path: 'assignments',
      component: AsignmentList
    }
  ]
},
{
  path: 'student',
  component: Mainlayout,
  canActivate: [authGuard],
  children: [
    {
      path: 'my-courses',
      component: MyCourse
    },
    {
      path: 'instructor-registration',
      component: InstructorRegistration
    },
  ]
},
{
  path: 'student',
  children:[
    {
      path: 'test',
      component:DoTest
    }
  ]
},
{
path: 'payments',
children: [
  {
    path: 'successful',
    component: PaymentSuccessful
  },
  {
    path: 'failed',
    component: PaymentFailed
  }
]
},
{
    path: 'unauthorized',
    component: NotFound
  },
  {
    path: '**',
    component: NotFound
  }
];
