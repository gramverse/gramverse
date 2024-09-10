import {
    ErrorRequestHandler,
    Router,
    Request,
    Response,
    NextFunction,
} from "express";
import {resetService} from "../config";
import {zodResetPasswordRequest} from "../models/reset-password/resetpassword-request";
import {HttpError, MissingFieldError, ValidationError} from "../errors/http-error";
import {ErrorCode} from "../errors/error-codes";
import {ZodError} from "zod";

export const resetRouter = Router();

resetRouter.post(
    "/request-reset-password",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {email} = req.body;

            if (!email) {
                throw new ValidationError("email");
            }

            await resetService.generateResetPasswordToken(email);

            res.status(200).send();
        } catch (err) {
            next(err);
        }
    },
);

resetRouter.post(
    "/validate-reset-token",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {token} = req.body;
            if (!token) {
                throw new HttpError(
                    400,
                    ErrorCode.INVALID_OR_EXPIRED_TOKEN,
                    "invalid token",
                );
            }
            await resetService.validateResetPasswordToken(token);
            res.status(200).send();
        } catch (err) {
            next(err);
        }
    },
);

resetRouter.post(
    "/reset-password",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const resetPasswordRequest = zodResetPasswordRequest.parse(
                req.body,
            );
            await resetService.resetPassword(resetPasswordRequest);
            res.status(200).send();
        } catch (err) {
            next(err);
        }
    },
);
