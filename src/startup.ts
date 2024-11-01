import express from "express";
import http from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import {userRouter} from "./routes/user.route";
import {resetRouter} from "./routes/reset.route";
import {postRouter} from "./routes/post.route";
import {fileRouter} from "./routes/file.route";
import swaggerUi from "swagger-ui-express";
import {swaggerDocs} from "./swagger";
import {errorHandler} from "./middlewares/error-handler-middleware";
import {notificationRouter} from "./routes/notification.route";
import {HttpError} from "./errors/http-error";
import {ErrorCode} from "./errors/error-codes";
import {searchRouter} from "./routes/search.route";
import {Server} from "socket.io";
import {messageRouter} from "./routes/message.router";
import {MessageController} from "./services/message-controller";
import { chatRouter } from "./routes/chat.route";
export const buildApp = () => {
    const app = express();
    const server = http.createServer();

    app.use(cors());
    app.use(cookieParser());
    const io = new Server(server, {
        cors: {
            origin: ["https://localhost:5173", "https://diverse.dev1403.rahnemacollege.ir"],
            methods: ["GET", "POST"],
            credentials: true,
        },
        maxHttpBufferSize: 2e8,
    });
    app.use("/api/files", fileRouter);
    app.use(express.json());

    app.use("/api/users", userRouter);
    app.use("/api/posts", postRouter);
    app.use("/api/reset", resetRouter);
    app.use("/api/notifications", notificationRouter);
    app.use("/api/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    app.use("/api/search", searchRouter);
    app.use("/api/messages", messageRouter);
    app.use("/api/chats", chatRouter);

    app.use((req, res, next) => {
        throw new HttpError(404, ErrorCode.PAGE_NOT_FOUND, "Page not found");
    });

    app.use(errorHandler);

    const messageController = new MessageController(io);

    io.on("connection", (socket) => {
        // Pass the connection to MessageController
        console.log(111);
        messageController.handleConnection(socket);
    });

    io.use((socket, next) => {
        console.log("received: ");
        next();
    });

    return {app, server};
};
