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

// User แบบเต็ม รวมโพสต์
export interface FullUser extends User {
  followers: User[]; // หรือแค่ array ของ userId ถ้าใช้แบบนั้น
  following: User[];
  posts: Post[];
}
