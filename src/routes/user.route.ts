import jwt, {JwtPayload} from "jsonwebtoken";
import jwtDecode from "jwt-decode";
import {
    followRepService,
    followService,
    jwtSecret,
    postRepService,
    postService,
    userService,
    userRepService,
} from "../config";
import {Router, Request, Response, NextFunction} from "express";
import {zodLoginRequest} from "../models/login/login-request";
import {zodRegisterRequest} from "../models/register/register-request";
import {
    AuthorizationError,
    HttpError,
    LoginError,
    MissingFieldError,
    SwitchAccountError,
    UnknownError,
} from "../errors/http-error";
import {ErrorCode} from "../errors/error-codes";
import {LoginResponse} from "../models/login/login-response";
import {AuthorizedUser, MultiUserToken} from "../models/profile/authorized-user";
import {zodProfileDto} from "../models/profile/edit-profile-dto";
import {zodFollowRequest} from "../models/follow/follow-request";
import {zodFollowingersRequest} from "../models/follow/get-followingers-request";
import {Followinger} from "../models/follow/followinger";
import {authMiddleware} from "../middlewares/auth-middleware";
import {zodGetCloseFriendsRequest} from "../models/follow/get-close-friends-request";
import {zodCloseFriendRequest} from "../models/follow/close-friend-request";
import {zodAcceptRequest} from "../models/follow/accept-request";
import {zodGetBlackListRequest} from "../models/block/get-blackList-request";
import {zodBlockRequest} from "../models/block/block-request";
import { tokenExtracter } from "../utilities/token-extracter";
import { jwtTokenGenerator } from "../utilities/jwt-token-generator";
import { maxExpirationTimeCalculator } from "../utilities/max-expiration-time-calculator";
import { AccountDto } from "../models/profile/account-dto";

export const userRouter = Router();

userRouter.post("/signup", async (req, res, next) => {
    try {
        const registerRequest = zodRegisterRequest.parse(req.body);
        const currentTokenData = await tokenExtracter(req.cookies["bearer"]);
        const loginResponse = await userService.signup(registerRequest, currentTokenData);
        if (!loginResponse) {
            res.send();
            return;
        }
        res.status(200)
            .cookie("bearer", loginResponse.token, {
                maxAge: loginResponse.expireTime,
            })
            .send();
    } catch (err) {
        next(err);
    }
});

userRouter.post("/login", async (req, res, next) => {
    try {
        const loginRequest = zodLoginRequest.parse(req.body);
        const currentTokenData = await tokenExtracter(req.cookies["bearer"]);
        const loginResponse = await userService.login(loginRequest, currentTokenData);
        if (!loginResponse) {
            res.send();
            return;
        }
        res.cookie("bearer", loginResponse.token, {
            maxAge: loginResponse.expireTime,
        })
            .status(201)
            .send();
    } catch (err) {
        next(err);
    }
});

userRouter.use(authMiddleware);

userRouter.get("/profile/:userName", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const profile = await userService.getProfile(
            req.params.userName,
            req.user.userName,
        );
        res.status(200).send(JSON.stringify(profile));
    } catch (err) {
        next(err);
    }
});

userRouter.get(
    "/check-username/:userName",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {userName} = req.params;

            const exists =
                await userRepService.checkUserNameExistance(userName);

            res.status(200).json({exists});
        } catch (err) {
            next(err);
        }
    },
);

userRouter.get("/myProfile", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const profile = await userService.getMyProfile(req.user.userName);
        res.status(200).send(JSON.stringify(profile));
    } catch (err) {
        next(err);
    }
});

userRouter.post("/profile", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const profileDto = zodProfileDto.parse(req.body);
        await userService.editProfile(profileDto, req.user);
        res.status(200).send();
    } catch (err) {
        next(err);
    }
});

userRouter.post("/follow", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const {followingUserName, isFollow} = req.body;
        if (!followingUserName) {
            throw new MissingFieldError("followingUserName");
        }
        const followerUserName = req.user.userName;
        if (isFollow) {
            await followService.follow(followerUserName, followingUserName);
        } else {
            await followService.unfollow(followerUserName, followingUserName);
        }
        res.status(200).send();
    } catch (err) {
        next(err);
    }
});

userRouter.get(
    "/followingers",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new AuthorizationError();
            }
            const {userName, page, limit, isFollowing} =
                zodFollowingersRequest.parse(req.query);
            let followingers: {followingers: Followinger[]; totalCount: number};
            if (isFollowing == "true") {
                followingers = await followRepService.getFollowings(
                    userName,
                    req.user.userName,
                    page,
                    limit,
                );
            } else {
                followingers = await followRepService.getFollowers(
                    userName,
                    req.user.userName,
                    page,
                    limit,
                );
            }
            res.status(200).send(followingers);
        } catch (err) {
            next(err);
        }
    },
);

userRouter.get("/closeFriends", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const {page, limit} = zodGetCloseFriendsRequest.parse(req.query);
        const closeFriends = await followRepService.getCloseFriends(
            req.user.userName,
            page,
            limit,
        );
        res.status(200).send(closeFriends);
    } catch (err) {
        next(err);
    }
});

userRouter.post("/closeFriend", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const {userName, isAdd} = zodCloseFriendRequest.parse(req.body);
        if (isAdd) {
            await followService.addCloseFriend(req.user.userName, userName);
        } else {
            await followService.removeCloseFriend(req.user.userName, userName);
        }
        res.status(200).send();
    } catch (err) {
        next(err);
    }
});

userRouter.post("/acceptRequest", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const {followerUserName, accepted} = zodAcceptRequest.parse(req.body);
        if (accepted) {
            await followService.acceptRequest(
                followerUserName,
                req.user.userName,
            );
        } else {
            await followService.declineRequest(
                followerUserName,
                req.user.userName,
            );
        }
        res.status(200).send();
    } catch (err) {
        next(err);
    }
});

userRouter.post("/block", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const {followerUserName, followingUserName, isBlock} =
            zodBlockRequest.parse({
                ...req.body,
                followerUserName: req.user.userName,
            });
        if (isBlock) {
            await followService.block(followerUserName, followingUserName);
        } else {
            await followService.unBlock(followerUserName, followingUserName);
        }
        res.status(200).send();
    } catch (err) {
        next(err);
    }
});

userRouter.get("/blackList", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const {page, limit} = zodGetBlackListRequest.parse(req.query);
        const blockList = await followService.getBlackList(
            req.user.userName,
            page,
            limit,
        );
        res.status(200).send(blockList);
    } catch (err) {
        next(err);
    }
});

userRouter.post("/signOut", async (req: Request, res, next) => {
    try {
        const currentTokenData = await tokenExtracter(req.cookies["bearer"]);
        if (!currentTokenData || currentTokenData.loggedInUsers.length < 2) {
            throw new AuthorizationError();
        }
        const newUsers = await currentTokenData.loggedInUsers.filter(u => u.userName != req.user?.userName);
        const newToken: MultiUserToken = {
            currentUser: newUsers[0],
            loggedInUsers: newUsers,
        };
        const signedToken = await jwtTokenGenerator(newToken);
        const maxAge = await maxExpirationTimeCalculator(newUsers);
        res.status(200)
        .cookie("bearer", signedToken, {maxAge})
        .send({userName: newToken.currentUser.userName});
    } catch (err) {
        next(err);
    }
});

userRouter.post("/removeFollow", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const {followerUserName} = req.body;
        if (!followerUserName) {
            throw new MissingFieldError("followerUserName");
        }
        const followingUserName = req.user.userName;
        await followService.removeFollow(followerUserName, followingUserName);
        res.status(200).send();
    } catch (err) {
        next(err);
    }
});

userRouter.get("/access/:userName", async (req: Request, res, next) => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }
        const hasAccess = await userService.checkMentionAccess(
            req.user.userName,
            req.params.userName,
        );
        res.status(200).send({hasAccess});
    } catch (err) {
        next(err);
    }
});

userRouter.post("/updateAll", async (req, res, next) => {
    try {
        const result = await followService.updateAllUsers();
        res.    status(200).send(result);
    } catch (err) {
        console.log(err);
        next(err);
    }
});

userRouter.get("/accounts", async (req, res, next) => {
    try {
        const currentTokenData = await tokenExtracter(req.cookies["bearer"]);
        const userNameList = currentTokenData!.loggedInUsers.map(u => u.userName);
        const accountList: AccountDto[] = [];
        for (const userName of userNameList) {
            const user = await userRepService.getUser(userName);
            if (!user) {
                throw new UnknownError();
            }
            const account: AccountDto = {userName, profileImage: user.profileImage};
            accountList.push(account);
        }
        res.status(200).send({accounts: accountList});
    } catch (err) {
        next(err);
    }
});

userRouter.post("/switchAccount", async (req, res, next) => {
    try {
        const currentTokenData = await tokenExtracter(req.cookies["bearer"]);
        const {userName} = req.body;
        const requestedUser = currentTokenData?.loggedInUsers.find(u => u.userName == userName);
        if (!requestedUser || !currentTokenData) {
            throw new SwitchAccountError();
        }
        const newToken = {...currentTokenData};
        newToken.currentUser = requestedUser;
        const signedToken = await jwtTokenGenerator(newToken);
        const maxAge = await maxExpirationTimeCalculator(newToken.loggedInUsers);
        res.status(200)
        .cookie("bearer", signedToken, {maxAge})
        .send({userName: newToken.currentUser.userName});
    } catch (err) {
        next(err);
    }
})
