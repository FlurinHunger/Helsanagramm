import { Component } from '@angular/core';
import { Injectable } from '@angular/core';
import { getAuth, signOut } from '@angular/fire/auth';
import { Router, RouterModule } from '@angular/router';
import { Firestore, doc, setDoc, getDoc, getDocs, updateDoc, Timestamp, addDoc, collection } from '@angular/fire/firestore';

@Component({
  selector: 'app-createpost',
  templateUrl: './createpost.component.html',
  styleUrls: ['./createpost.component.scss']
})
export class CreatepostComponent {
  auth = getAuth()
  postBody = ""
  username = ""
  uid = localStorage.getItem("uid") ?? "."
  

  constructor(public routerModule: RouterModule, private router: Router, private firestore: Firestore) {
    console.log(this.auth.currentUser?.uid)
  }
  async createPost() {
      await this.getUsername().then(username => {
         addDoc(collection(this.firestore, 'Posts'), {
          "userUid": this.uid,
          "post": this.postBody,
          "timestamp": Timestamp.now(),
          "username": username
  
        }).then(()=>{
          console.log("success")
          this.router.navigate([""]);
        }).catch(error => {
          console.log(error)
        })
      })
      this.postBody = ""
  }

  async getUsername() {
    const userDoc = await getDoc(doc(this.firestore, "Users", this.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData?.["username"] ?? "null";
    }
  }

}


