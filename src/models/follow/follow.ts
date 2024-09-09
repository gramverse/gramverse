import {FollowRequestState} from "./follow-request-state";

export interface IFollow extends Follow, Document {}

export interface Follow {
    _id: string;
    followerUserName: string;
    followingUserName: string;
    followRequestState: FollowRequestState;
    isCloseFriend: boolean;
    isBlocked: boolean;
    isDeleted: boolean;
    created_time: Date
    updated_time: Date
}
