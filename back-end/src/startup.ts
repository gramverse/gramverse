import express, { ErrorRequestHandler } from "express";
import {ZodError} from "zod";
import {HttpError} from "./errors/http-error";

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

    app.use(express.json());

    app.use(errorHandler);

    app.use((req, res, next) => {
        res.status(404).send({messge: "Not found"});
    });

    return app;
}