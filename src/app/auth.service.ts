import { Injectable } from '@angular/core';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Router, RouterModule } from '@angular/router';
import { Firestore, doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = getAuth()
  
  constructor(public routerModule: RouterModule, private router: Router, private firestore: Firestore) {}

  createAccount(email: string, password: string, username: string) {
    createUserWithEmailAndPassword(this.auth, email, password).then(user => {
      localStorage.setItem("uid", user.user.uid)
      setDoc(doc(this.firestore, 'Users', user.user.uid), {
        "username": username,
        "darkMode": false,
      }).then(()=>{
        console.log("success")
        this.router.navigate([""]);
      }).catch(error => {
        console.log(error)
      })
    })
  }

  login(email: string, password: string) {
    signInWithEmailAndPassword(this.auth, email, password).then(user => {
      localStorage.setItem("uid", user.user.uid)
      this.router.navigate([""]);
    })
  }

  logout() {
    localStorage.removeItem("uid");
    this.auth.signOut();
    this.router.navigate(['/login']);
  }
  

  validateSession() {
    if(localStorage.getItem("uid") == null) {
      this.router.navigate(['/login']);
    }
  }
}
