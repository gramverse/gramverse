import {FollowRequestState} from "../follow/follow-request-state" 
import { EventType } from "./event-type";

export interface INotification extends Document {
    _id: string,
    isMine: boolean,
    creationDate: Date,
    updateDate: Date,
    isRead: boolean,
    eventId: string,
}

export interface Notification {
    _id: string,
    isMine: boolean,
    creationDate: Date,
    updateDate: Date,
    isRead: boolean,
    eventId: string,
}


export interface BaseNotification {
    eventType: string,
    performerUserName: string,
    creationDate: Date,
    isMine: Boolean,
    isRead: boolean,
}

export interface FollowNotification extends BaseNotification {
    followingUserName: string,
}

export interface CommentNotification extends BaseNotification {
    postId: string,
    postImage: string,
    postCreator: string,
    comment: string,
}

export interface LikeNotification extends BaseNotification {
    postId: string,
    postImage: string,
    postCreator: string,
}

export interface MentionNotification extends BaseNotification {
    postId: string,
    postImage: string,
}