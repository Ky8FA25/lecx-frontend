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
  path: 'student',
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
}
];
