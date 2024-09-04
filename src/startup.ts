import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import {userRouter} from "./routes/user.route";
import {tokenRouter} from "./routes/reset.route";
import {postRouter} from "./routes/post.route"
import {fileRouter} from "./routes/file.route";
import swaggerUi from "swagger-ui-express";
import { swaggerDocs } from "./swagger";
import {errorHandler} from "./middlewares/error-handler-middleware";
import {notificationRouter} from "./routes/notification.route";

export const buildApp = () => {
    const app = express();
    
    app.use(cors());
    app.use(cookieParser());
    app.use("/api/files", fileRouter);
    app.use(express.json());
    
    app.use("/api/users",userRouter);
    app.use("/api/posts", postRouter);
    app.use("/api/reset", tokenRouter);
    app.use("/api/notifications", notificationRouter);
    app.use("/api/api-docs",swaggerUi.serve, swaggerUi.setup(swaggerDocs))
    app.use(errorHandler);

    app.use((req, res, next) => {
        res.status(404).send({messge: "Not found"});
    });

    return app;
}