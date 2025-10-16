import { Routes } from '@angular/router';
import { Login } from './features/auth/components/login/login';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { Register } from './features/auth/components/register/register';
import { VerifyEmail } from './features/auth/components/verify-email/verify-email';
import { Mainlayout } from './layouts/mainlayout/mainlayout';
import { Home } from './features/home/components/home/home';
import { Component } from '@angular/core';
import { Coursedetail } from './features/courses/components/coursedetail/coursedetail';
import { Courselist } from './features/courses/components/courselist/courselist';
import { Mycourse } from './features/courses/components/mycourse/mycourse';
import { Courselayout } from './layouts/courselayout/courselayout';
import { Assignmentlist } from './features/assignment/components/assignmentlist/assignmentlist';
import { Userprofile } from './features/user/components/userprofile/userprofile';
import { authGuard } from './core/guards/auth-guard';

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
        path: 'enterotp',
        component: VerifyEmail
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
  path: 'course',
  component: Mainlayout,
  children: [
    {
      path: 'detail',
        component: Coursedetail
    },
    {
      path: 'list',
      component:Courselist
    },
    {
      path: 'mycourse',
      component: Mycourse
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
    }
  ]
}
];
