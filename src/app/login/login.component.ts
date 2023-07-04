import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = ""
  password = ""

  constructor(private authService: AuthService, public routerModule: RouterModule, public router: Router) {
    if (localStorage.getItem("uid")) {
      this.router.navigate([""]);
    }
  }
  
  onLogin() {
    this.authService.login(this.email, this.password);
  }

}
