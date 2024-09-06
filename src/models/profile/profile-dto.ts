import { FollowRequestState } from "../follow/follow-request-state"

export type ProfileDto = {
    userName: string,
    firstName: string,
    lastName: string,
    isPrivate: boolean,
    profileImage: string,
    bio: string,
    followRequestState: FollowRequestState,
    isBlocked: boolean,
    isCloseFriend: boolean,
    hasBlockedUs: boolean,
    requestState: FollowRequestState,
    followerCount: number,
    followingCount: number,
    postCount: number,
}