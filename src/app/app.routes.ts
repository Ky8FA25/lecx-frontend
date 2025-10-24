import { Routes } from '@angular/router';
import { Login } from './features/auth/components/login/login';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { Register } from './features/auth/components/register/register';
import { Mainlayout } from './layouts/mainlayout/mainlayout';
import { Home } from './features/home/components/home/home';
import { Coursedetail } from './features/courses/components/coursedetail/coursedetail';
import { Courselist } from './features/courses/components/courselist/courselist';
import { Mycourse } from './features/courses/components/mycourse/mycourse';
import { Courselayout } from './layouts/courselayout/courselayout';
import { Assignmentlist } from './features/assignment/components/assignmentlist/assignmentlist';
import { Userprofile } from './features/user/components/userprofile/userprofile';
import { authGuard } from './core/guards/auth-guard';
import { InstructorCourse } from './features/courses/components/instructor-course/instructor-course';
import { UserChangePassword } from './features/user/components/user-change-password/user-change-password';
import { EditUserProfile } from './features/user/components/edit-user-profile/edit-user-profile';
import { ForgotPassword } from './features/auth/components/forgot-password/forgot-password';
import { ResetPassword } from './features/auth/components/reset-password/reset-password';

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
      component:Courselist
    },
    {
      path: 'mycourse',
      component: Mycourse
    },
    {
      path: 'list',
      component: InstructorCourse
    }
  ]
},
{
  path: 'assignment',
  component: Courselayout,
  children: [
    {
      path: 'list',
        component: Assignmentlist
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
      component: Userprofile
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
}
];
