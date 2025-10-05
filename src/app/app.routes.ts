import { Routes } from '@angular/router';
import { Login } from './features/auth/components/login/login';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { Register } from './features/auth/components/register/register';
import { VerifyEmail } from './features/auth/components/verify-email/verify-email';
import { Mainlayout } from './layouts/mainlayout/mainlayout';
import { Home } from './features/home/components/home/home';

export const routes: Routes = [

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
  }
];
