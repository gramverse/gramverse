import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../config";
import { ErrorCode } from "../errors/error-codes";
import { HttpError } from "../errors/http-error";
import {AuthorizedUser} from "../models/profile/authorized-user";
import { LoginRequest } from "../models/login/login-request";
import { LoginResponse, User, UserToValidate } from "../models/login/login-response";
import {EditProfileDto} from "../models/profile/edit-profile-dto";
import { RegisterRequest } from "../models/register/register-request";
import {UserRepository} from "../repository/user.repository";
import {TokenRepository} from "../repository/token.repository";
import {Token} from "../models/reset-password/token";
import { FollowRepository } from "../repository/follow.repository";
import { PostRepository } from "../repository/post.repository";
import {MyProfileDto} from "../models/profile/my-profile-dto";
import {ProfileDto} from "../models/profile/profile-dto";
import { FollowRequest } from "../models/follow/follow-request";
import { Follow } from "../models/follow/follow";

export interface IUserService {
    signup: (registerRequest: RegisterRequest) => Promise<LoginResponse|undefined>;
    checkEmailExistance: (email: string) => Promise<boolean>;
    checkUserNameExistance: (userName: string) => Promise<boolean>;
    validateInfo: (user: Partial<UserToValidate>, isForSignup: boolean) => void;
    login: (loginRequest: LoginRequest) => Promise<LoginResponse|undefined>;
    getUser: (userNameOrPassword: string) => Promise<User|undefined>;
    // ... reset password functions
    // editProfile: (profile: Profile) => Promise<Profile>;
}

export class UserService implements IUserService {
    constructor(private userRepository: UserRepository, private postRepository: PostRepository, private tokenRepository: TokenRepository, private followRepository: FollowRepository) {}

    getUser = async (userNameOrEmail : string) =>{
        const isEmail = userNameOrEmail.includes("@");
        let user ;
        if (isEmail) {
            user = await this.userRepository.getUserByEmail(userNameOrEmail);
        } else {
            user = await this.userRepository.getUserByUserName(userNameOrEmail);
        }
        return user;
    } 
    
    login = async (loginRequest : LoginRequest) => {
        const user = await this.getUser(loginRequest.userName);
        
        if (!user){
            return undefined;
        }
        const passwordMatch = await bcrypt.compare(loginRequest.password, user.passwordHash);
        if (!passwordMatch){
            return undefined;
        }
        const tokenPayload: AuthorizedUser = {
            _id: user._id||"",
            userName: user.userName,
            email: user.email
        };
        let token : string;
        if (loginRequest.rememberMe) {
            token = await jwt.sign({ data: tokenPayload }, jwtSecret, { expiresIn: "168h" });
        } else {
            token = await jwt.sign({ data: tokenPayload }, jwtSecret, { expiresIn: "72h"});
        }
        
        const loginResponse : LoginResponse = {user, token};
        return loginResponse;
    }

    validateInfo = (user: Partial<UserToValidate>, hasNewPassword: boolean) => {
        const userNamePattern = /^(?!.{33})[a-zA-Z0-9_.]{6,}$/;
        if (!user.userName || !userNamePattern.test(user.userName)) {
            throw new HttpError(400, ErrorCode.INVALID_USERNAME, "Invalid username");
        }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!user.email || !emailPattern.test(user.email)) {
            throw new HttpError(400, ErrorCode.INVALID_EMAIL, "Invalid email");
        }
        if (hasNewPassword && (!user.password || user.password.length < 8 || user.password.length > 32)) {
            throw new HttpError(400, ErrorCode.INVALID_PASSWORD, "Invalid password");
        }
    }

    checkEmailExistance = async (email: string) => {
        return await this.userRepository.checkEmailExistance(email);
    }

    checkUserNameExistance = async (userName: string) => {
        return await this.userRepository.checkUserNameExistance(userName);
    }

    signup = async (registerRequest: RegisterRequest) => {
        const userToValidate: Partial<UserToValidate> = {
            userName: registerRequest.userName,
            email: registerRequest.email,
            password: registerRequest.password
        };
        this.validateInfo(userToValidate, true);
        const emailExists = await this.checkEmailExistance(registerRequest.email);
        if (emailExists) {
            throw new HttpError(400, ErrorCode.EMAIL_EXISTS, "Email Exists");
        }
        const userNameExists = await this.checkUserNameExistance(registerRequest.userName);
        if (userNameExists) {
            throw new HttpError(400, ErrorCode.USERNAME_EXISTS, "Username exists");
        }
        const passwordHash = await bcrypt.hash(registerRequest.password, 10);
        const newUser: User = {
            userName: registerRequest.userName,
            firstName: "",
            lastName: "",
            email: registerRequest.email,
            passwordHash,
            profileImage: "",
            isPrivate: false,
            bio: "",
        }
        const createdUser = await this.userRepository.add(newUser);
        if (!createdUser) {
            throw new HttpError(400, ErrorCode.UNSUCCESSFUL_SIGNUP, "Signup unsuccessful due to an unknown reason");
        }
        const loginRequest: LoginRequest = {
            userName: registerRequest.userName,
            password: registerRequest.password,
            rememberMe: false
        }
        const loginResponse = await this.login(loginRequest);
        return loginResponse;
    }

    getMyProfile = async (userName: string) => {
        const user = await this.getUser(userName);
        if (!user) {
            return undefined;
        }
        const {email, firstName, lastName, profileImage, isPrivate, bio} = user;
        const followerCount = await this.followRepository.getFollowerCount(user.userName);
        const followingCount = await this.followRepository.getFollowingCount(user.userName);
        const postCount = await this.postRepository.getPostCount(user.userName);
        const profile: MyProfileDto = {
            userName: user.userName,
            email,
            firstName,
            lastName,
            profileImage,
            isPrivate,
            bio,
            followerCount,
            followingCount,
            postCount
        };
        return profile;
    }

    getProfile = async (userName: string, myUserName: string) => {
        const user = await this.getUser(userName);
        if (!user) {
            return undefined;
        }
        const {email, firstName, lastName, profileImage, isPrivate, bio} = user;
        const isFollowed = await this.followRepository.followExists(myUserName, userName);
        const followerCount = await this.followRepository.getFollowerCount(user.userName);
        const followingCount = await this.followRepository.getFollowingCount(user.userName);
        const postCount = await this.postRepository.getPostCount(user.userName);
        const profile: ProfileDto = {
            userName: user.userName,
            firstName,
            lastName,
            profileImage,
            isPrivate,
            bio,
            isFollowed,
            followerCount,
            followingCount,
            postCount
        };
        return profile;
    }

    editProfile = async (profileDto: EditProfileDto, user: AuthorizedUser) => {
        const passwordIsUpdated = !!profileDto.password;
        this.validateInfo(profileDto, passwordIsUpdated);
        if (profileDto.userName != user.userName) {
            if (await this.checkUserNameExistance(profileDto.userName)) {
                throw new HttpError(400, ErrorCode.USERNAME_EXISTS, "Username exists");
            }
        }
        if (profileDto.email != user.email) {
            if (await this.checkEmailExistance(profileDto.email)) {
                throw new HttpError(400, ErrorCode.EMAIL_EXISTS, "Email exists");
            }
        }
        const oldUser = await this.userRepository.getUserByEmail(user.email);
        if (!oldUser) {
            throw new HttpError(500, ErrorCode.UNKNOWN_ERROR, "An error occurred reading database.");
        }
        const passwordHash = passwordIsUpdated ? await bcrypt.hash(profileDto.password, 10) : oldUser.passwordHash;
        const userToBeUpdated = {
            _id: user._id,
            ... profileDto,
            passwordHash,
        };
        const updatedUser = await this.userRepository.update(userToBeUpdated);
        return updatedUser;
    }

    follow = async (followRequest: FollowRequest) => {
        const {followerUserName, followingUserName} = followRequest;
        const existingFollow = await this.followRepository.getFollow(followerUserName, followingUserName);
        if (existingFollow) {
            if (!existingFollow.isDeleted) {
                return true;
            }
            if (await this.followRepository.undeleteFollow(followerUserName, followingUserName)) {
                return true;
            }
            return false;
        }
        const newFollow: Follow = {
            followerUserName,
            followingUserName,
            isDeleted: false,
            created_time: new Date(),
            updated_time: new Date()
        };
        if (!(await this.followRepository.add(newFollow)))  {
            throw new HttpError(500, ErrorCode.UNKNOWN_ERROR, "Unkown problem occurred");
        }
        return true;
    }

    unfollow = async (followRequest: FollowRequest) => {
        const {followerUserName, followingUserName} = followRequest;
        const existingFollow = await this.followRepository.getFollow(followerUserName, followingUserName);
        if (!existingFollow || existingFollow.isDeleted) {
            return true;
        }
        if (!(await this.followRepository.deleteFollow(followerUserName, followingUserName))) {
            throw new HttpError(500, ErrorCode.UNKNOWN_ERROR, "Unknown error");
        }
        return true;
    }
}