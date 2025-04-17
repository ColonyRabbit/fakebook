export interface User {
  id: string;
  username: string;
  email: string;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface Comments {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  postId: string;
  user: User;
}
export interface IResponseRCommentsType {
  comments: Comments[];
}
