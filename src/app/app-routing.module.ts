import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { CreatepostComponent } from './createpost/createpost.component';
import { ProfilepageComponent } from './profilepage/profilepage.component';

const routes: Routes = [
  {
    path: "",
    component: MainComponent
  },
  {
    path: "login",
    component: LoginComponent
  },
  {
    path: "signup",
    component: SignupComponent
  },
  {
    path: "createpost",
    component: CreatepostComponent
  },
  {
    path: "p/:uid",
    component: ProfilepageComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
