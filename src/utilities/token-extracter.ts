import jwt, { JwtPayload } from "jsonwebtoken";
import { ErrorCode } from "../errors/error-codes";
import { HttpError } from "../errors/http-error";
import { jwtSecret } from "../config";
import { MultiUserToken } from "../models/profile/authorized-user";

export const tokenExtracter = async (token: string) => {
    if (!token) {
        return;
    }
    const payload = jwt.verify(token, jwtSecret) as JwtPayload;
    const tokenData = payload["data"] as MultiUserToken;
    return tokenData;
}