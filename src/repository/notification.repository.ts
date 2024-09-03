import { Model } from "mongoose";
import { INotification } from "../models/notification/notification";
import { notificationSchema } from "../models/notification/notification-schema";

export class notificationRepository {
    private notifications: Model<INotification>;
    constructor(private dataHandler : typeof import ("mongoose")) {
        this.notifications = dataHandler.model<INotification>("notifications", notificationSchema);
    }
}