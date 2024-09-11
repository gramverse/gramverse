import {AuthorizedUser, MultiUserToken} from "../models/profile/authorized-user";
import jwt, {JwtPayload} from "jsonwebtoken";
import jwtDecode from "jwt-decode";
import {jwtSecret} from "../config";
import {Request, Response, NextFunction} from "express";
import {AuthorizationError, HttpError} from "../errors/http-error";
import {ErrorCode} from "../errors/error-codes";
import { jwtTokenGenerator } from "../utilities/jwt-token-generator";
import { maxExpirationTimeCalculator } from "../utilities/max-expiration-time-calculator";
import { tokenExtracter } from "../utilities/token-extracter";

declare module "express" {
    interface Request {
        user?: AuthorizedUser;
    }
}

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const tokenData = await tokenExtracter(req.cookies["bearer"]);
        if (!tokenData) {
            throw new AuthorizationError();
        }
        const {currentUser, loggedInUsers} = tokenData;
        const notExpiredUsers: AuthorizedUser[] = [];
        const currentMilliseconds = new Date().getTime();
        for (const user of loggedInUsers) {
            if (new Date(user.expirationTime).getTime() > currentMilliseconds) {
                notExpiredUsers.push(user);
            }
        }
        if (notExpiredUsers.length == 0) {
            throw new AuthorizationError();
        }
        const newToken: MultiUserToken = {
            currentUser: notExpiredUsers[0],
            loggedInUsers: notExpiredUsers,
        };
        const signedToken = await jwtTokenGenerator(newToken);
        const maxAge = await maxExpirationTimeCalculator(notExpiredUsers);
        if (loggedInUsers.length != newToken.loggedInUsers.length) {
            res.cookie("bearer", signedToken, {maxAge});
        }
        if (new Date(currentUser.expirationTime).getTime() > new Date().getTime()) {
            req.user = tokenData.currentUser;
            next();
            return;
        }
        res.status(402)
        .send({userName: newToken.currentUser.userName});
    } catch (err) {
        next(err);
    }
};
