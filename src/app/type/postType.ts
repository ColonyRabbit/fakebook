// types/post.ts

export interface User {
  id: string;
  username: string;
  email: string;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  photoUrl: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: Omit<User, "password">;
  likeCount: number;
  isLiked: boolean;
  comments: string;
}

export interface IResIResponsePostsType {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    totalPosts: number;
    totalPages: number;
  };
}
