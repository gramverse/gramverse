import {Notification, BaseNotification, FollowNotification, CommentNotification, LikeNotification, MentionNotification} from "../models/notification/notification";
import { EventType } from "../models/notification/event-type";

export const getMockData = () => {
    const notifications: BaseNotification[] = [];
    const l1: LikeNotification = {
        performerUserName: "alireza",
        postId: "66d6a7f1ad35879dc10abb1a",
        postImage: "/api/files/af767930e1f2efdc7d94bba0efae86f8",
        isMine: true,
        isRead: false,
        eventType: EventType.LIKE,
        creationDate: new Date(),
    };
    notifications.push(l1);
    return notifications;
}
