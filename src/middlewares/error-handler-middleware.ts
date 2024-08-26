import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import {HttpError} from "../errors/http-error";
import {ErrorCode} from "../errors/error-codes";
import multer from "multer";

export const errorHandler: ErrorRequestHandler = (err: Error, req, res, next) => {
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
