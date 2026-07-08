import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProductsComponent } from './pages/products/products.component';
import { CartComponent } from './pages/cart/cart.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { OrderDetailComponent } from './pages/order-detail/order-detail.component';
import { AdminComponent } from './pages/admin/admin.component';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { homeRedirectGuard } from './guards/home-redirect.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [homeRedirectGuard],
    pathMatch: 'full'
  },

  {
    path: 'home',
    component: HomeComponent,
    canActivate: [homeRedirectGuard]
  },

  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'register',
    component: RegisterComponent
  },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },

  {
    path: 'products',
    component: ProductsComponent,
    canActivate: [authGuard]
  },

  {
    path: 'cart',
    component: CartComponent,
    canActivate: [authGuard]
  },

  {
    path: 'orders',
    component: OrdersComponent,
    canActivate: [authGuard]
  },

  {
    path: 'orders/:id',
    component: OrderDetailComponent,
    canActivate: [authGuard]
  },

  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard]
  },

  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [adminGuard]
  },

  {
    path: '**',
    redirectTo: 'home'
  }
];
