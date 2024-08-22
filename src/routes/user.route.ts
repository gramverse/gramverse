import jwt, { JwtPayload } from "jsonwebtoken";
import jwtDecode from "jwt-decode";
import {jwtSecret, postService, userService} from "../config"
import e, {Router, Request, Response, NextFunction} from "express";
import { zodLoginRequest } from "../models/login/login-request";
import {zodRegisterRequest} from "../models/register/register-request";
import { HttpError } from "../errors/http-error";
import { ErrorCode } from "../errors/error-codes";
import { LoginResponse } from "../models/login/login-response";
import { AuthorizedUser } from "../models/profile/authorized-user";
import { zodProfileDto } from "../models/profile/edit-profile-dto";
import {FollowRequest, zodFollowRequest} from "../models/follow/follow-request";

declare module "express" {
    interface Request {
        user?: AuthorizedUser;
    }
}

export const userRouter = Router();

/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: Register a new user.
 *     tags:
 *       - Users
 *     requestBody:
 *       description: User registration information.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully.
 *       401:
 *         description: Not authorized.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Log in a user.
 *     tags:
 *       - Users
 *     requestBody:
 *       description: User login information.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               password:
 *                 type: string
 *               rememberMe:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: User logged in successfully.
 *       401:
 *         description: Invalid username or password.
 *       500:
 *         description: Internal server error.
 */


/**
 * @swagger
 * /api/users/profile/{userName}:
 *   get:
 *     summary: Get user profile by username.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: userName
 *         schema:
 *           type: string
 *         required: true
 *         description: The username of the user to retrieve.
 *     responses:
 *       200:
 *         description: User profile retrieved successfully.
 *       401:
 *         description: Not authorized.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/users/myProfile:
 *   get:
 *     summary: Get the profile of the currently logged-in user.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: User's own profile retrieved successfully.
 *       401:
 *         description: Not authorized.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/users/profile:
 *   post:
 *     summary: Edit the profile of the currently logged-in user.
 *     tags:
 *       - Users
 *     requestBody:
 *       description: Profile information to update.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileDto'
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *       401:
 *         description: Not authorized.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/users/follow:
 *   post:
 *     summary: Follow a user
 *     tags:
 *       - Follow
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetUsername:
 *                 type: string
 *                 example: "targetUser123"
 *     responses:
 *       200:
 *         description: User successfully followed
 *       401:
 *         description: Unauthorized, token is missing or invalid
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */



/**
 * @swagger
 * /api/users/unfollow:
 *   post:
 *     summary: Unfollow a user.
 *     tags:
 *       - Follow
 *     requestBody:
 *       description: Unfollow request data.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               followingUserName:
 *                 type: string
 *                 description: The username of the user to unfollow.
 *     responses:
 *       200:
 *         description: Successfully unfollowed the user.
 *       400:
 *         description: Missing following username.
 *       401:
 *         description: Not authorized.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/posts/posts:
 *   get:
 *     summary: Get posts for the currently logged-in user.
 *     tags:
 *       - Posts
 *     responses:
 *       200:
 *         description: Posts retrieved successfully.
 *       401:
 *         description: Not authorized.
 *       500:
 *         description: Internal server error.
 */



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
            throw new HttpError(401, ErrorCode.INVALID_USERNAME_OR_PASSWORD, "Username or password incorrect");
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

userRouter.get("/profile/:userName", async (req: Request, res) => {
    try {
        if (!req.user) {
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        const profile = await userService.getProfile(req.params.userName, req.user.userName);
        res.status(200).send(JSON.stringify(profile));
    } catch (err) {
        if (err instanceof HttpError) {
            res.status(err.statusCode).send(err);
            return;
        }
        console.error(err);
        res.status(500).send();
    }
});

userRouter.get("/myProfile", async (req: Request, res) => {
    try {
        if (!req.user) {
            throw new HttpError(401, ErrorCode.UNAUTHORIZED, "Not authorized");
        }
        const profile = await userService.getMyProfile(req.user.userName);
        res.status(200).send(JSON.stringify(profile));
    } catch (err) {
        if (err instanceof HttpError) {
            res.status(err.statusCode).send(err);
            return;
        }
        console.error(err);
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
        const postDtos = await postService.getPosts(userName);
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