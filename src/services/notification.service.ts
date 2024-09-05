import {NotificationRepository} from "../repository/notification.repository";
import {Notification, BaseNotification, FollowNotification, CommentNotification, LikeNotification, MentionNotification} from "../models/notification/notification";
import { EventType } from "../models/notification/event-type";
import {getMockData} from "../utilities/mock";

export class NotificationService {
    constructor(private notificationRepository: NotificationRepository) {}

    getMyNotifications = async (userName: string, page: number, limit: number) => {
        return {notifications: getMockData(), totalCount: 1};
    }
}