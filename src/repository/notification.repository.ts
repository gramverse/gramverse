import { Model } from "mongoose";
import { INotification } from "../models/notification/notification";
import { notificationSchema } from "../models/notification/notification-schema";

export class NotificationRepository {
    private notifications: Model<INotification>;
    constructor(private dataHandler : typeof import ("mongoose")) {
        this.notifications = dataHandler.model<INotification>("notifications", notificationSchema);
    }

    getUserNotifications = async (userName: string, isMine: boolean, skip: number, limit: number) => {
        return (await this.notifications.find({userName, isMine})
        .skip(skip)
        .limit(limit)
        .sort({creationDate: -1}))
        .map(n => n.toObject());
    }

    getNotifCount = async (userName: string, isMine: boolean) => {
        return await this.notifications.countDocuments({userName, isMine});
    }

    getUnreadCount = async (userName: string) => {
        return await this.notifications.countDocuments({userName, seen: false});
    }
}