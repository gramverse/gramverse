import jwt, { JwtPayload } from "jsonwebtoken";
import jwtDecode from "jwt-decode";
import {jwtSecret, postService, userService} from "../config"
import e, {Router, Request, Response, NextFunction} from "express";
import { zodLoginRequest } from "../models/login-request";
import {zodRegisterRequest} from "../models/register-request";
import { HttpError } from "../errors/http-error";
import { ErrorCode } from "../errors/error-codes";
import { LoginResponse } from "../models/login-response";
import { AuthorizedUser } from "../models/authorized-user";
import { zodProfileDto } from "../models/edit-profile-dto";
import {FollowRequest, zodFollowRequest} from "../models/follow-request";

declare module "express" {
    interface Request {
        user?: AuthorizedUser;
    }
}

export const userRouter = Router();

userRouter.post("/signup", async (req, res) => {
    try {
        const registerRequest = zodRegisterRequest.parse(req.body);
        const loginResponse = await userService.signup(registerRequest);
        if (!loginResponse) {
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        res.status(200).cookie("bearer", loginResponse.token).send(loginResponse.user);
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
        res.cookie("bearer", loginResponse.token).status(201).send(loginResponse.user);
    } catch(err) {
        if (err instanceof HttpError) {
            res.status(err.statusCode).send(err);
            return;
        }
        res.status(500).send();
    }
});

userRouter.use((req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies["bearer"];
        if (!token) {
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        const authorizedUser = jwt.verify(token, jwtSecret) as JwtPayload;
        req.user = authorizedUser["data"] as AuthorizedUser;
        next();
    } catch (err) {
        if (err instanceof HttpError) {
            res.status(err.statusCode).send(err);
            return;
        }
        res.status(500).send();
    }
});

userRouter.get("/profile", async (req: Request, res) => {
    try {
        if (!req.user) {
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        const profile = await userService.getProfile(req.user.userName);
        res.status(200).send(profile);
    } catch (err) {
        if (err instanceof HttpError) {
            res.status(err.statusCode).send(err);
            return;
        }
        res.status(500).send();
    }
});

userRouter.post("/profile", async (req: Request, res) => {
    try {
        if (!req.user) {
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        const profileDto = zodProfileDto.parse(req.body);
        const updatedProfile = await userService.editProfile(profileDto, req.user);
        res.status(200).send(updatedProfile);
    } catch (err) {
        if (err instanceof HttpError) {
            res.status(err.statusCode).send(err);
            return;
        }
        res.status(500).send();
    }
});

userRouter.post("/follow", async (req: Request, res) => {
    try {
        if (!req.user) {
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        const {followingUserName} = req.body;
        if (!followingUserName) {
            throw new HttpError(400, ErrorCode.MISSING_FOLLOWING_USERNAME, "Missing following username");
        }
        const followRequest: FollowRequest = {followerUserName: req.user.userName, followingUserName};
        const success = await userService.follow(followRequest);
        if (!success) {
            res.status(500).send();
        }
        res.status(200).send();
    } catch (err) {
        if (err instanceof HttpError) {
            res.status(err.statusCode).send(err);
            return;
        }
        console.error(err);
        res.status(500).send();
    }
})

userRouter.post("/unfollow", async (req: Request, res) => {
    try {
        if (!req.user) {
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        const {followingUserName} = req.body;
        if (!followingUserName) {
            throw new HttpError(400, ErrorCode.MISSING_FOLLOWING_USERNAME, "Missing following username");
        }
        const followRequest: FollowRequest = {followerUserName: req.user.userName, followingUserName};
        const success = await userService.unfollow(followRequest);
        if (!success) {
            res.status(500).send();
        }
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

userRouter.get("/posts", async (req : Request, res) => {
    try{
        if (!req.user) {
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        const userName = req.user.userName;
        const postDtos = await postService.getPost(userName);
        res.send(postDtos);



    } catch(err){
        if (err instanceof HttpError) {
            console.error(err);
            res.status(err.statusCode).send(err);
            return;
        }
        console.log(err);
        res.status(500).send();
    }
    




});