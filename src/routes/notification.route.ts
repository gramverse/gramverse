import { HttpError } from "../errors/http-error";
import { ErrorCode } from "../errors/error-codes";
import { authMiddleware } from "../middlewares/auth-middleware";
import {Router, Request, Response, NextFunction} from "express";
import { zodNotificationRequest} from "../models/notification/notification-request";
import {notificationService} from "../config";

export const notificationRouter = Router();

notificationRouter.use(authMiddleware);

notificationRouter.get("/mine", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        const {page, limit} = zodNotificationRequest.parse(req.query);
        const notifications = await notificationService.getNotifications(req.user.userName, true, page, limit);
        res.status(200).send(notifications);
    } catch (err) {
        next(err);
    }
});

notificationRouter.get("/followings", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        const {page, limit} = zodNotificationRequest.parse(req.query);
        const notifications = await notificationService.getNotifications(req.user.userName, true, page, limit);
        res.status(200).send([]);
    } catch (err) {
        next(err);
    }
});