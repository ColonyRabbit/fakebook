export type IResIResponsePostsType = {
  id: string;
  photoUrl: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: User;
  likeCount: number;
  isLiked: boolean;
  comments: string;
};
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  photoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
