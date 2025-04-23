// Like object ที่แนบมากับ post
export interface Like {
  userId: string;
  postId: string;
}

// post._count
export interface PostCount {
  likes: number;
  comments: number;
}

// User ที่แนบกับโพสต์
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// Post หลัก
export interface Post {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  fileUrl: string | null;
  user: User;
  _count: PostCount;
  likes: Like[];
}
export interface FollowerRelation {
  followerId: string;
  followingId: string;
  createdAt: string;
  follower: User;
}

export interface FollowingRelation {
  followerId: string;
  followingId: string;
  createdAt: string;
  following: User;
}

// User แบบเต็ม รวมโพสต์
export interface FullUser extends User {
  followers: FollowerRelation[];
  following: FollowingRelation[];
  posts: Post[];
}
