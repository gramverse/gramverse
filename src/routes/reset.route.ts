import { Router, Request, Response, NextFunction } from "express";
import { tokenService } from "../config";  
import { zodResetPasswordRequest } from "../models/reset-password/resetpassword-request";
import { HttpError } from "../errors/http-error";
import { ErrorCode } from "../errors/error-codes";

export const tokenRouter = Router();

/**
 * @swagger
 * /api/reset/request-reset-password:
 *   post:
 *     summary: Request a password reset token
 *     tags:
 *        - Password Reset
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
 *                 example: "hawmidak@gmail.com"
 *     responses:
 *       200:
 *         description: Reset token generated and sent to the email.
 *       400:
 *         description: Invalid email address provided.
 *       500:
 *         description: Server error.
 */
/**
 * @swagger
 * /api/reset/validate-reset-token:
 *   post:
 *     summary: Validate a password reset token
 *     tags:
 *       - Password Reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: valid-token-string
 *     responses:
 *       200:
 *         description: Token is valid
 *       400:
 *         description: Invalid or expired token
 */

/**
 * @swagger
 * /api/reset/reset-password:
 *   post:
 *     summary: Reset the password using a valid token
 *     tags:
 *       - Password Reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "0e2a30ec-73da-4638-9e6b-95822e036580"
 *               newPassword:
 *                 type: string
 *                 example: "Hamid1568"
 *     responses:
 *       200:
 *         description: Password successfully reset
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
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
<<<<<<< Updated upstream
        res.status(200).send("Token is valid");
=======
        res.status(200).send()
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
        res.status(200).send("Password has been reset successfully");
=======
        res.status(200).send();
>>>>>>> Stashed changes
    } catch (err) {
        if (err instanceof HttpError) {
            res.status(err.statusCode).send(err);
            return;
        }
        console.error(err);
        res.status(500).send();
    }
});
