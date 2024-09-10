import {ErrorRequestHandler} from "express";
import {ZodError} from "zod";
import {HttpError, UploadFileError} from "../errors/http-error";
import {ErrorCode} from "../errors/error-codes";
import multer from "multer";

export const errorHandler: ErrorRequestHandler = (
    err: Error,
    req,
    res,
    next,
) => {
    if (err instanceof ZodError) {
        res.status(400).send({message: err.errors});
        return;
    } else if (err instanceof HttpError) {
        if (err.errorCode == 401) {
            res.clearCookie("bearer");
        }
        res.status(err.statusCode).send(err);
        return;
    } else if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            res.status(400).send(new UploadFileError("large file size"));
            return;
        } else {
            res.status(400).send(new UploadFileError("unknown"));
            return;
        }
    }
    res.status(500).send(err);
};
