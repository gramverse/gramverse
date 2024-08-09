import {userService} from "../config"
import {Router} from "express";
import { zodLoginRequest } from "../models/login-request";
import {zodRegisterRequest} from "../models/register-request";
import { HttpError } from "../errors/http-error";
import { ErrorCode } from "../errors/error-codes";
import { LoginResponse } from "../models/login-response";

export const userRouter = Router();

userRouter.post("/signup", async (req, res) => {
    try {
        console.log(req.body);
        const registerRequest = zodRegisterRequest.parse(req.body);
        const loginResponse = await userService.signup(registerRequest);
        if (!loginResponse) {
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        res.status(200).send(loginResponse.user);
    } catch(err) {
        if (err instanceof HttpError) {
            res.status(err.statusCode).send(err);
            return;
        }
        res.status(500).send();
    }
});

userRouter.post("/login", async (req, res) => {
    try{
        const loginRequest = zodLoginRequest.parse(req.body);
        const loginResponse = await userService.login(loginRequest);
        if (!loginResponse) {
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Username or password incorrect");
        }
        res.header("Authorization", `Bearer ${loginResponse.token}`).status(201).send(loginResponse.user);
    } catch(err) {
        if (err instanceof HttpError) {
            res.status(err.statusCode).send(err);
            return;
        }
        res.status(500).send();
    }
});
