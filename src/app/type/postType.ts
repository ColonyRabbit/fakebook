export type PostType = {
  id: string;
  postText: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    photo?: string;
  };
  username?: string;
  isLiked: boolean;
  likeCount?: number;
  likes?: Array<{ userId: string }>;
  _count?: {
    likes: number;
  };
};
