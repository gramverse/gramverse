export type ProfileDto = {
    userName: string,
    firstName: string,
    lastName: string,
    isPrivate: boolean,
    profileImage: string,
    bio: string,
    isFollowed: boolean,
    followerCount: number,
    followingCount: number,
    postCount: number,
}