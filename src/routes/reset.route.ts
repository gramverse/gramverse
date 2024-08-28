import { ErrorRequestHandler, Router, Request, Response, NextFunction } from "express";
import { tokenService } from "../config";  
import { zodResetPasswordRequest } from "../models/reset-password/resetpassword-request";
import { HttpError } from "../errors/http-error";
import { ErrorCode } from "../errors/error-codes";
import { ZodError } from "zod";

export const tokenRouter = Router();

tokenRouter.post("/request-reset-password", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        
        if(!email){
            throw new HttpError(400,ErrorCode.INVALID_EMAIL,"invalid email")
        }
        
        await tokenService.generateResetPasswordToken(email);
        
        
        res.status(200).send();
    } catch (err) {
        next(err);
    }
});

tokenRouter.post("/validate-reset-token", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.body;
        if (!token){
            throw new HttpError(400,ErrorCode.INVALID_OR_EXPIRED_TOKEN,"invalid token")
        }
        await tokenService.validateResetPasswordToken(token);
        res.status(200).send()
    } catch (err) {
        next(err);
    }
});

tokenRouter.post("/reset-password", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const resetPasswordRequest = zodResetPasswordRequest.parse(req.body);
        await tokenService.resetPassword(resetPasswordRequest);
        res.status(200).send();
    } catch (err) {
        next(err);
    }
});