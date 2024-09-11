import jwt from "jsonwebtoken";
import { jwtSecret } from "../config";
import { MultiUserToken } from "../models/profile/authorized-user";

export const jwtTokenGenerator = async (data: MultiUserToken) => {
    const token = await jwt.sign({data}, jwtSecret);
    return token;
}