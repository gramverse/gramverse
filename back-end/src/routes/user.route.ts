import {userService} from "../config"
import {Router} from "express";
import { zodLoginRequest } from "../models/login-request";
import { HttpError } from "../errors/http-error";
import { ErrorCode } from "../errors/error-codes";
import { LoginResponse } from "../models/login-response";
export const userRouter = Router();


userRouter.post("/login", async (req, res) => {
    const loginRequest = zodLoginRequest.parse(req.body);
    const loginResponse : LoginResponse = await userService.login(loginRequest)
    if (!loginResponse.user) {
        throw new HttpError(401, ErrorCode.UNAUTHORIZED);
    }
    res.header('Authorization', `Bearer ${loginResponse.token}`).status(201).send(loginResponse.user);

})
