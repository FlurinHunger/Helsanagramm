import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  email = ""
  username = ""
  password = ""

  constructor(private authService: AuthService) {}

  ngOnInit() {
  }

  onSignup() {
    this.authService.createAccount(this.email, this.password, this.username);
  }
}
