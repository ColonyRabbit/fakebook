interface Post {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: {
    id: string;
    username: string;
    photoUrl?: string;
  };
  likeCount: number;
  isLiked: boolean;
  comments: number;
  fileUrl?: string;
  likes: { user: { username: string } }[];
}

interface Pagination {
  page: number;
  limit: number;
  totalPosts: number;
  totalPages: number;
  hasMore: boolean;
}

interface GetAllPostsResponse {
  posts: Post[];
  pagination: Pagination;
}
