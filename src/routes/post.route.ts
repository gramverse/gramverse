import {AuthorizedUser} from "../models/profile/authorized-user";
import {Router, Request} from "express";
import { HttpError } from "../errors/http-error";
import { ErrorCode } from "../errors/error-codes";


declare module "express" {
    interface Request {
        user?: AuthorizedUser;
    }
}

export const userRouter = Router();

userRouter.post("/like", async (req: Request, res) => {
    try{
        if (!req.user){
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");

        }
    } catch(err){

    }


})