export interface UserBasicInfo {
  id: string;
  username: string;
  email: string;
  password: string;
  photoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FollowerRelation {
  followerId: string;
  followingId: string;
  createdAt: Date;
  follower: UserBasicInfo;
}

export interface FollowingRelation {
  followerId: string;
  followingId: string;
  createdAt: Date;
  following: UserBasicInfo;
}

export interface FullUser extends UserBasicInfo {
  followers: FollowerRelation[];
  following: FollowingRelation[];
}
