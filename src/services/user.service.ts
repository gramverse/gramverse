import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {jwtSecret, userService} from "../config";
import {ErrorCode} from "../errors/error-codes";
import {
    HttpError,
    LoginError,
    NotFoundError,
    UnknownError,
    ValidationError,
} from "../errors/http-error";
import {AuthorizedUser, MultiUserToken} from "../models/profile/authorized-user";
import {LoginRequest} from "../models/login/login-request";
import {
    LoginResponse,
    User,
    UserToValidate,
} from "../models/login/login-response";
import {EditProfileDto} from "../models/profile/edit-profile-dto";
import {RegisterRequest} from "../models/register/register-request";
import {UserRepository} from "../repository/user.repository";
import {TokenRepository} from "../repository/token.repository";
import {Token} from "../models/reset-password/token";
import {FollowRepository} from "../repository/follow.repository";
import {PostRepository} from "../repository/post.repository";
import {MyProfileDto} from "../models/profile/my-profile-dto";
import {ProfileDto} from "../models/profile/profile-dto";
import {Follow} from "../models/follow/follow";
import {Followinger} from "../models/follow/followinger";
import {FollowRequestState} from "../models/follow/follow-request-state";
import {PostService} from "./post.service";
import {NotificationService} from "./notification.service";
import {UserRepService} from "./user.rep.service";
import {PostRepService} from "./post.rep.service";
import {FollowRepService} from "./follow.rep.service";
import { jwtTokenGenerator } from "../utilities/jwt-token-generator";
import { maxExpirationTimeCalculator } from "../utilities/max-expiration-time-calculator";

export interface IUserService {
    // signup: (
    //     registerRequest: RegisterRequest,
    // ) => Promise<LoginResponse | undefined>;
    validateInfo: (user: Partial<UserToValidate>, isForSignup: boolean) => void;
    // login: (loginRequest: LoginRequest) => Promise<LoginResponse | undefined>;
    // ... reset password functions
    // editProfile: (profile: Profile) => Promise<Profile>;
}

export class UserService implements IUserService {
    constructor(
        private postRepService: PostRepService,
        private userRepService: UserRepService,
        private followRepService: FollowRepService,
        private notificationService: NotificationService,
    ) {}

    login = async (loginRequest: LoginRequest, oldToken: MultiUserToken|undefined) => {
        const user = await this.userRepService.getUser(loginRequest.userName);

        if (!user) {
            throw new LoginError();
        }
        const passwordMatch = await bcrypt.compare(
            loginRequest.password,
            user.passwordHash,
        );
        if (!passwordMatch) {
            throw new LoginError();
        }
        if (oldToken && oldToken.loggedInUsers.find(u => u.userName == loginRequest.userName)) {
            return;
        }
        let expirationTime: Date;
        if (loginRequest.rememberMe) {
            expirationTime = new Date(Date.now() + 7 * 24 * 3600 * 1000);
        } else {
            expirationTime = new Date(Date.now() + 3 * 24 * 3600 * 1000);
        }
        const newUser: AuthorizedUser = {
            _id: user._id,
            userName: user.userName,
            email: user.email,
            creationTime: new Date(),
            expirationTime,
        };
        const newToken: MultiUserToken = {
            currentUser: newUser,
            loggedInUsers: [...oldToken?.loggedInUsers||[], newUser],
        };
        const token = await jwtTokenGenerator(newToken);

        const maxAge = await maxExpirationTimeCalculator(newToken.loggedInUsers);
        const loginResponse: LoginResponse = {user, token, expireTime: maxAge};
        return loginResponse;
    };

    validateInfo = (user: Partial<UserToValidate>, hasNewPassword: boolean) => {
        const userNamePattern = /^(?!.{33})[a-zA-Z0-9_.]{6,}$/;
        if (user.userName && !userNamePattern.test(user.userName)) {
            throw new ValidationError("userName");
        }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!user.email || !emailPattern.test(user.email)) {
            throw new ValidationError("email");
        }
        if (
            hasNewPassword &&
            (!user.password ||
                user.password.length < 8 ||
                user.password.length > 32)
        ) {
            throw new ValidationError("password");
        }
    };

    signup = async (registerRequest: RegisterRequest, oldToken: MultiUserToken|undefined) => {
        this.validateInfo(registerRequest, true);
        const emailExists = await this.userRepService.checkEmailExistance(
            registerRequest.email,
        );
        if (emailExists) {
            throw new HttpError(400, ErrorCode.EMAIL_EXISTS, "Email Exists");
        }
        const userNameExists = await this.userRepService.checkUserNameExistance(
            registerRequest.userName,
        );
        if (userNameExists) {
            throw new HttpError(
                400,
                ErrorCode.USERNAME_EXISTS,
                "Username exists",
            );
        }
        const passwordHash = await bcrypt.hash(registerRequest.password, 10);
        const newUser: Partial<User> = {
            userName: registerRequest.userName,
            email: registerRequest.email,
            passwordHash,
            isPrivate: false,
        };
        const createdUser = await this.userRepService.createUser(newUser);
        if (!createdUser) {
            throw new UnknownError();
        }
        const loginRequest: LoginRequest = {
            userName: registerRequest.userName,
            password: registerRequest.password,
            rememberMe: false,
        };
        const loginResponse = await this.login(loginRequest, oldToken);
        return loginResponse;
    };

    getMyProfile = async (userName: string) => {
        const user = await this.userRepService.getUser(userName);
        if (!user) {
            throw new UnknownError();
        }
        const {
            email,
            firstName,
            lastName,
            profileImage,
            isPrivate,
            bio,
            followerCount,
        } = user;
        const followingCount = await this.followRepService.getFollowingCount(
            user.userName,
        );
        const postCount = await this.postRepService.getPostCount(
            user.userName,
            false,
        );
        const profile: MyProfileDto = {
            userName,
            email,
            firstName,
            lastName,
            profileImage,
            isPrivate,
            bio,
            followerCount,
            followingCount,
            postCount,
        };
        return profile;
    };

    getProfile = async (userName: string, myUserName: string) => {
        const user = await this.userRepService.getUser(userName);
        if (!user) {
            throw new NotFoundError("user");
        }
        const {
            email,
            firstName,
            lastName,
            profileImage,
            isPrivate,
            bio,
            followerCount,
        } = user;
        const {followRequestState, isBlocked, isCloseFriend} =
            (await this.followRepService.getFollow(myUserName, userName)) || {
                followRequestState: FollowRequestState.NONE,
                isBlocked: false,
                isCloseFriend: false,
            };
        const {isBlocked: hasBlockedUs, followRequestState: requestState} =
            (await this.followRepService.getFollow(userName, myUserName)) || {
                isBlocked: false,
                followRequestState: FollowRequestState.NONE,
            };
        const followingCount = await this.followRepService.getFollowingCount(
            user.userName,
        );
        const postCount = await this.postRepService.getPostCount(
            user.userName,
            false,
        );
        const profile: ProfileDto = {
            userName: user.userName,
            firstName,
            lastName,
            profileImage,
            isPrivate,
            bio,
            followRequestState,
            isBlocked,
            isCloseFriend,
            hasBlockedUs,
            requestState,
            followerCount,
            followingCount,
            postCount,
        };
        return profile;
    };

    editProfile = async (profileDto: EditProfileDto, user: AuthorizedUser) => {
        const passwordIsUpdated = !!profileDto.password;
        this.validateInfo(profileDto, passwordIsUpdated);
        if (profileDto.email != user.email) {
            if (
                await this.userRepService.checkEmailExistance(profileDto.email)
            ) {
                throw new HttpError(
                    400,
                    ErrorCode.EMAIL_EXISTS,
                    "Email exists",
                );
            }
        }
        const oldUser = await this.userRepService.getUser(user.email);
        if (!oldUser) {
            throw new UnknownError();
        }
        if (oldUser.isPrivate && !profileDto.isPrivate) {
            this.followRepService.acceptPendingRequests(user.userName);
        }
        const passwordHash = passwordIsUpdated
            ? await bcrypt.hash(profileDto.password, 10)
            : oldUser.passwordHash;
        const userToBeUpdated = {
            ...profileDto,
            passwordHash,
        };
        await this.userRepService.updateUser(user.userName, userToBeUpdated);
    };

    checkMentionAccess = async (myUserName: string, userName: string) => {
        if (userName == myUserName) {
            return false;
        }
        const mentionerFollow = await this.followRepService.getFollow(
            myUserName,
            userName,
        );
        const mentionedFollow = await this.followRepService.getFollow(
            userName,
            myUserName,
        );
        if (mentionerFollow && mentionerFollow.isBlocked) {
            return false;
        }
        if (mentionedFollow && mentionedFollow.isBlocked) {
            return false;
        }
        const mentionedUser = await this.userRepService.getUser(userName);
        if (!mentionedUser) {
            return false;
        }
        if (
            mentionedUser.isPrivate &&
            (!mentionerFollow ||
                mentionerFollow.followRequestState !=
                    FollowRequestState.ACCEPTED)
        ) {
            return false;
        }
        return true;
    };
}
