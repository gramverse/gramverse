import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/http-error';

export const errorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
    console.error(err);

    const statusCode = err.statusCode || 500;
    const errorCode = err.errorCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({ errorCode, message });
};
