import express, { ErrorRequestHandler } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import {ZodError} from "zod";
import {HttpError} from "./errors/http-error";
import {userRouter} from "./routes/user.route";
import {tokenRouter} from "./routes/reset.route";
import {fileRouter} from "./routes/file.route";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof ZodError) {
        res.status(400).send({message: err.errors});
        return;
    } else if (err instanceof HttpError) {
        res.status(err.statusCode).send(err.errorCode);
        return;
    }
    res.status(500).send();
}

export const buildApp = () => {
    const app = express();

    app.use(cors());
    app.use(cookieParser());
    app.use("/files", fileRouter);
    app.use(express.json());

    // app.use(errorHandler);
    
    app.use("/api/users", userRouter);
    app.use("/api/reset", tokenRouter);

    app.use((req, res, next) => {
        res.status(404).send({messge: "Not found"});
    });

    return app;
}