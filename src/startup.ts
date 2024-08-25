import express, { ErrorRequestHandler } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import {ZodError} from "zod";
import {HttpError} from "./errors/http-error";
import {userRouter} from "./routes/user.route";
import {tokenRouter} from "./routes/reset.route";
import {postRouter} from "./routes/post.route"
import {fileRouter} from "./routes/file.route";
import swaggerUi from "swagger-ui-express";
import { swaggerDocs } from "./swagger";
import multer from "multer";
import { ErrorCode } from "./errors/error-codes";

const errorHandler: ErrorRequestHandler = (err: Error, req, res, next) => {
    if (err instanceof ZodError) {
        res.status(400).send({message: err.errors});
        return;
    } else if (err instanceof HttpError) {
        if (err.errorCode == 401) {
            res.clearCookie("bearer");
        }
        res.status(err.statusCode).send(err);
        return;
    } else     if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            res.status(400).send(new HttpError(400, ErrorCode.FILE_TOO_LARGE, "Max file size = 4 MB"));
            return;
        } else {
            res.status(400).send(new HttpError(400, ErrorCode.FILE_UPLOAD_ERROR, "an error occurred uploading file"));
            return;
        }
    }
    res.status(500).send(err);
}




export const buildApp = () => {
    const app = express();
    
    app.use(cors());
    app.use(cookieParser());
    app.use("/api/files", fileRouter);
    app.use(express.json());
    
    app.use("/api/users",userRouter);
    app.use("/api/posts", postRouter);
    app.use("/api/reset", tokenRouter);
    app.use("/api/api-docs",swaggerUi.serve, swaggerUi.setup(swaggerDocs))
    app.use(errorHandler);

    app.use((req, res, next) => {
        res.status(404).send({messge: "Not found"});
    });

    return app;
}