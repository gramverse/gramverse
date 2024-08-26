import {FollowRequestState} from "./follow-request-state";

export interface IFollow extends Document {
    _id: string;
    followerUserName: string
    followingUserName: string
    followRequestState: FollowRequestState;
    isCloseFriend: boolean;
    isBlocked: boolean;
    isDeleted: boolean;
    created_time: Date
    updated_time: Date
}

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
