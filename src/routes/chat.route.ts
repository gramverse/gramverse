import {
    ErrorRequestHandler,
    Router,
    Request,
    Response,
    NextFunction,
} from "express";
import {
    AuthorizationError,
    HttpError,
    MissingFieldError,
    UnknownError,
    ValidationError,
} from "../errors/http-error";
import {ErrorCode} from "../errors/error-codes";
import { chatService, messageService } from "../config";
import { zodChatRequest } from "../models/message/chat-request";
import { authMiddleware } from "../middlewares/auth-middleware";

export const chatRouter = Router();

chatRouter.use(authMiddleware);

chatRouter.get("/chatList", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const myUserName = req.user.userName;
        const {page, limit} = zodChatRequest.parse(
            req.query,
        );
        const chats = await messageService.chatList(
            myUserName,
            page,
            limit,
        );
        res.status(200).send(chats);
    } catch (err) {
        next(err);
    }
});

chatRouter.get("/getId", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const myUserName = req.user.userName;
        const {friendUserName} = req.query;
        if (!friendUserName || typeof friendUserName != "string") {
            throw new UnknownError();
        }
        const chatId = await chatService.getChat(myUserName, friendUserName);
        res.status(200).send({chatId});
    } catch (err) {
        next(err);
    }
});