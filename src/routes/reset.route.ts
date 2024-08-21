import { Router, Request, Response, NextFunction } from "express";
import { tokenService } from "../config";  
import { zodResetPasswordRequest } from "../models/reset-password/resetpassword-request";
import { HttpError } from "../errors/http-error";
import { ErrorCode } from "../errors/error-codes";

export const tokenRouter = Router();

/**
 * @swagger
 * /request-reset-password:
 *   post:
 *     summary: Request a password reset token
 *     description: Sends a password reset token to the user's email address.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Reset token generated and sent to the email.
 *       400:
 *         description: Invalid email address provided.
 *       500:
 *         description: Server error.
 */


tokenRouter.post("/request-reset-password", async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        
        if(!email){
            throw new HttpError(400,ErrorCode.INVALID_EMAIL,"invalid email")
        }
        
        await tokenService.generateResetPasswordToken(email);
        
        
        res.status(200).send();
    } catch (err) {
        if (err instanceof HttpError) {
            res.status(err.statusCode).send(err);
            return;
        }
        console.error(err);
        res.status(500).send();
    }
});

tokenRouter.post("/validate-reset-token", async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        if (!token){
            throw new HttpError(400,ErrorCode.INVALID_OR_EXPIRED_TOKEN,"invalid token")
        }
        await tokenService.validateResetPasswordToken(token);
        res.status(200).send("Token is valid");
    } catch (err) {
        if (err instanceof HttpError) {
            res.status(err.statusCode).send(err);
            return;
        }
        console.error(err);
        res.status(500).send();
    }
});

tokenRouter.post("/reset-password", async (req: Request, res: Response) => {
    try {
        const resetPasswordRequest = zodResetPasswordRequest.parse(req.body);
        await tokenService.resetPassword(resetPasswordRequest);
        res.status(200).send("Password has been reset successfully");
    } catch (err) {
        if (err instanceof HttpError) {
            res.status(err.statusCode).send(err);
            return;
        }
        console.error(err);
        res.status(500).send();
    }
});
