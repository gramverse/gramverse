import {AuthorizationError, HttpError, UnknownError} from "../errors/http-error";
import {authMiddleware} from "../middlewares/auth-middleware";
import {AuthorizedUser} from "../models/profile/authorized-user";
import {Router, Request, Response, NextFunction} from "express";
import {zodMessageRequest} from "../models/message/message-request";
import {messageService} from "../config";
import { zodGetMessagesRequest } from "../models/message/get-messages-request";

declare module "express" {
    interface Request {
        user?: AuthorizedUser;
    }
}

export const messageRouter = Router();

messageRouter.use(authMiddleware);

messageRouter.get("/messages", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const {page, limit, chatId} = zodGetMessagesRequest.parse(req.query);
        const messages = await messageService.getMessages(
            chatId,
            page,
            limit,
        );
        res.status(200).send(messages);
    } catch (err) {
        next(err);
    }
});

messageRouter.get("/chatDetail", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const {chatId} = req.query;
        if (!chatId || typeof chatId != "string") {
            throw new UnknownError();
        }
        const chatDetail = await messageService.getChatDetail(req.user.userName, chatId);
        res.send(chatDetail);
    } catch (err) {
        next(err);
    }
})

messageRouter.get("/unreadCount", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const unreadCount = await messageService.getTotalUnreadCount(req.user.userName);
        res.status(200).send({unreadCount});
    } catch(err) {
        next(err);
    }
});