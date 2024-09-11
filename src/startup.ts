import express from "express";
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
import { searchRouter } from "./routes/search.route";

export const buildApp = () => {
    const app = express();

    app.use(cors());
    app.use(cookieParser());
    app.use("/api/files", fileRouter);
    app.use(express.json());

    app.use("/api/users", userRouter);
    app.use("/api/posts", postRouter);
    app.use("/api/reset", resetRouter);
    app.use("/api/notifications", notificationRouter);
    app.use("/api/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    app.use("/api/search", searchRouter);

    app.use((req, res, next) => {
        throw new HttpError(404, ErrorCode.PAGE_NOT_FOUND, "Page not found");
    });

    app.use(errorHandler);

    return app;
};
