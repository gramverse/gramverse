import {AuthorizedUser} from "../models/profile/authorized-user";
import jwt, { JwtPayload } from "jsonwebtoken";
import jwtDecode from "jwt-decode";
import {jwtSecret} from "../config"
import{Request, Response, NextFunction} from "express";
import {HttpError} from "../errors/http-error";
import { ErrorCode} from "../errors/error-codes";

declare module "express" {
    interface Request {
        user?: AuthorizedUser;
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies["bearer"];
        if (!token) {
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        const authorizedUser = jwt.verify(token, jwtSecret) as JwtPayload;
        req.user = authorizedUser["data"] as AuthorizedUser;
        next();
    } catch (err) {
        next(err);
    }
}
