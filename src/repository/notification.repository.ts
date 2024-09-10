import {Model} from "mongoose";
import {INotification} from "../models/notification/notification";
import {notificationSchema} from "../models/notification/notification-schema";
import {AddNotifRequest} from "../models/notification/add-notif-request";
import { convertTypeForArray } from "../utilities/convert-type";

export class NotificationRepository {
    private notifications: Model<INotification>;
    constructor(private dataHandler: typeof import("mongoose")) {
        this.notifications = dataHandler.model<INotification>(
            "notifications",
            notificationSchema,
        );
    }

    add = async (userName: string, eventId: string, isMine: boolean) => {
        const createdNotification = await this.notifications.create({
            userName,
            eventId,
            isMine,
        });
        return createdNotification._id;
    };

    getNotificationCount = async (userName: string, isMine: boolean) => {
        return await this.notifications.countDocuments({userName, isMine});
    };

    getUnreadCount = async (userName: string) => {
        return await this.notifications.countDocuments({userName, seen: false});
    };

    getUserNotifications = async (
        userName: string,
        isMine: boolean,
        skip: number,
        limit: number,
    ) => {
        const notifications = 
            await this.notifications
                .find({userName, isMine})
                .skip(skip)
                .limit(limit)
                .sort({creationDate: -1});
        return notifications;
    };

    markAsRead = async (idList: string[]) => {
        await this.notifications.updateMany(
            {_id: {$in: idList}},
            {$set: {seen: true}},
        );
    };

    DeleteNotification = async (eventId: string) => {
        await this.notifications.deleteMany({eventId});
    };
}
