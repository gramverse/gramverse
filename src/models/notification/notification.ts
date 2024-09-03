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
    _id: string,
    performerUserName: string,
    targetId: string,
    creationDate: Date,
    updateDate: Date,
    isMine: Boolean,
    eventType: EventType,
}

export interface FollowNotification extends BaseNotification {
    followRequestState: FollowRequestState,
}

export interface CommentNotification extends BaseNotification {
    comment: string,
}

export interface LikeNotification extends BaseNotification {}

export interface MentionNotification extends BaseNotification {}