import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { where, onSnapshot, getDocs, Firestore, collection, Timestamp, setDoc, getDoc, doc, deleteDoc, orderBy, query } from '@angular/fire/firestore'
import { updateDoc } from 'firebase/firestore';

@Component({
  selector: 'app-profilepage',
  templateUrl: './profilepage.component.html',
  styleUrls: ['./profilepage.component.scss']
})
export class ProfilepageComponent implements OnInit {
  uid = localStorage.getItem("uid") ?? "." // UID of current logged in
  uidProfile: string = ""; // UID of current profile
  profileUsername: string = "";
  displayPosts: string = "createdPosts";
  isActive: boolean = true
  followers: number = 0
  following: number = 0
  isFollowing: boolean = false

  followText: string = "Follow"

  posts: {id: string, content: string, time: string, username: string, likes: number, isLiked: boolean}[] = []

  constructor(private route: ActivatedRoute, private firestore: Firestore, private authService: AuthService, public routerModule: RouterModule, public router: Router) {
    this.authService.validateSession();
    
  }

  ngOnInit() {
    this.followers = 0
    this.following = 0
    this.route.paramMap.subscribe(params => {
      this.uidProfile = params.get('uid') ?? "uid";
      if (this.uidProfile) {
        this.fetchUserProfile();
        this.getFollowers()
        if(this.displayPosts == "createdPosts") {
          this.fetchUserPosts();
        }
        else if(this.displayPosts == "likedPosts"){
          this.fetchUserLikedPosts();
        }
        else {
          this.fetchUserPosts();
        }
        
      } else {
        this.router.navigate([""]); 
      }
    });
  }

  fetchUserPosts() {
    this.posts = []
    onSnapshot(query(collection(this.firestore, "Posts"), where("userUid", "==", this.uidProfile), orderBy("timestamp", "desc")), (snapshot) => {
      snapshot.forEach(post => {
        if(post.exists()){
          const date = new Date(post.data()["timestamp"].seconds*1000)
          this.getLikes(post.id).then(likes => {
            this.posts.push({id: post.id, content: post.data()["post"], time: `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`, username: post.data()["username"], likes: likes.count, isLiked: likes.liked})
          })
          console.log(this.uidProfile)
        }
      });
    }, (error) => {
      console.log(error);
    })
  }

  async fetchUserLikedPosts() {
    this.posts = []
    const postSnapshot = await getDocs(collection(this.firestore, "Posts"));
    postSnapshot.forEach(async (post) => {
        if(post.exists()){
            const likesSnapshot = await getDocs(collection(this.firestore, "Posts", post.id, "likedBy"));
            let liked = likesSnapshot.docs.some(doc => doc.id === this.uidProfile);
            if (liked) {
                const date = new Date(post.data()['timestamp'].seconds*1000);
                const likes = await this.getLikes(post.id);
                this.posts.push({
                    id: post.id,
                    content: post.data()['post'],
                    time: `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
                    username: post.data()['username'],
                    likes: likes.count,
                    isLiked: likes.liked
                })
            }
        }
    });
}

  
  
  

  async fetchUserProfile() {
    const userDoc = await getDoc(doc(this.firestore, "Users", this.uidProfile));
    if (userDoc.exists()) {
      this.profileUsername = userDoc.data()['username']

      const followingSnapshot = await getDocs(collection(this.firestore, "Users", this.uidProfile, "followedBy"));
      const followingList = followingSnapshot.docs.map(doc => doc.id);

      if (followingList.includes(this.uid)) {
        this.isFollowing = true
        this.followText = "Unfollow"
        console.log(this.isFollowing);
      } else {
        this.isFollowing = false
        this.followText = "Follow"
        console.log(this.isFollowing);
      }

    } else {
      this.router.navigate([""]);
    }
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

  switchToLiked() {
    this.displayPosts = "likedPosts";
    this.ngOnInit()
    this.isActive = false
  }

  switchToPosts() {
    this.displayPosts = "createdPosts";
    this.ngOnInit()
    this.isActive = true
  }

  followUser() {
    if (this.isFollowing) {
      this.isFollowing = false
      this.followers--
      this.followText = "Follow"
      deleteDoc(doc(this.firestore, "Users", this.uidProfile, "followedBy", this.uid))
      deleteDoc(doc(this.firestore, "Users", this.uid, "following", this.uidProfile))
    }
    else {
      this.isFollowing = true
      this.followers++
      this.followText = "Unfollow"
      setDoc(doc(this.firestore, "Users", this.uidProfile, "followedBy", this.uid), {})
      setDoc(doc(this.firestore, "Users", this.uid, "following", this.uidProfile), {})
    }
  }

  async getFollowers() {
    let followers: number = 0
    let following: number = 0
    await getDocs(collection(this.firestore, "Users", this.uidProfile, "followedBy")).then(followed => {
      followed.forEach(follow => {
        this.followers++
      });
    })
    await getDocs(collection(this.firestore, "Users", this.uidProfile, "following")).then(followed => {
      followed.forEach(follow => {
        this.following++
      });
    })
  }

}
