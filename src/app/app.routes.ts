import { Routes } from '@angular/router';
import { CalendarComponent } from './components/calendar/calendar.component';
import { AbsenceComponent } from './components/absence/absence.component';
import { AvailabilityComponent } from './components/availability/availability.component';
import { BookingComponent } from './components/booking/booking.component';
import { CartComponent } from './components/cart/cart.component';
import { ConsultationDetailsComponent } from './components/consultation-details/consultation-details.component';
import { AuthGuard } from './guard/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { DoctorListComponent } from './components/doctor-list/doctor-list.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'calendar',
    pathMatch: 'full',
  },
  { path: 'absence', component: AbsenceComponent, canActivate: [AuthGuard] },
  {
    path: 'availability',
    component: AvailabilityComponent,
    canActivate: [AuthGuard],
  },
  { path: 'booking', component: BookingComponent, canActivate: [AuthGuard] },
  { path: 'cart', component: CartComponent, canActivate: [AuthGuard] },
  { path: 'calendar', component: CalendarComponent, canActivate: [AuthGuard] },
  {
    path: 'calendar/:id',
    component: CalendarComponent,
    canActivate: [AuthGuard],
  },
  { path: 'doctor-list', component: DoctorListComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: 'login' },
  { path: 'unauthorized', component: UnauthorizedComponent },
];
