import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';
import { onSnapshot, getDocs, Firestore, collection, Timestamp, setDoc, getDoc, doc, deleteDoc, orderBy, query } from '@angular/fire/firestore'


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  uid = localStorage.getItem("uid") ?? "."
  posts: {id: string, content: string, time: string, username: string, likes: number, isLiked: boolean}[] = []

  constructor(private firestore: Firestore, private authService: AuthService, public routerModule: RouterModule, public router: Router) {
    this.authService.validateSession();
    onSnapshot(query(collection(this.firestore, "Posts"), orderBy("timestamp", "desc")), posts => {
      posts.forEach(post => {
        this.posts = []
        if(post.exists()){
          console.log(post.data()["post"])
          const date = new Date(post.data()["timestamp"].seconds*1000)
          this.getLikes(post.id).then(likes => {
            this.posts.push({id: post.id, content: post.data()["post"], time: `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`, username: post.data()["username"], likes: likes.count, isLiked: likes.liked})
          })
        }
      });
    })
  }
 

  onLogout() {
    this.authService.logout();
  }

  likePost(post: {id: string, content: string, time: string, username: string, likes: number, isLiked: boolean}) {
    if (post.isLiked) {
      post.isLiked = false
      post.likes--
      deleteDoc(doc(this.firestore, "Posts", post.id, "likedBy", this.uid))
    }
    else {
      post.isLiked = true
      post.likes++
      setDoc(doc(this.firestore, "Posts", post.id, "likedBy", this.uid), {})
    }
  }

  async getLikes(id: string) {
    let postLikes = 0
    let liked: boolean = false
    await getDocs(collection(this.firestore, "Posts", id, "likedBy")).then(likes => {
      likes.forEach(like => {
        if(like.id == this.uid) {
          liked = true
        }
        postLikes++
      });
    })
    return {count: postLikes, liked: liked}
  }


}


