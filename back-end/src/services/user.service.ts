import { LoginRequest } from "../models/login-request";
import {UserRepository} from "../repository/user.repository";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { jwtSecret } from "../config";
import { LoginResponse, UserToValidate } from "../models/login-response";
import {User} from "../models/login-response";
import { RegisterRequest } from "../models/register-request";
import { HttpError } from "../errors/http-error";
import { ErrorCode } from "../errors/error-codes";

export interface IUserService {
    signup: (registerRequest: RegisterRequest) => Promise<LoginResponse|undefined>;
    checkEmailExistance: (email: string) => Promise<boolean>;
    checkUserNameExistance: (userName: string) => Promise<boolean>;
    validateInfo: (user: Partial<UserToValidate>) => void;
    login: (loginRequest: LoginRequest) => Promise<LoginResponse|undefined>;
    getUser: (userNameOrPassword: string) => Promise<User|undefined>;
    // ... reset password functions
    // editProfile: (profile: Profile) => Promise<Profile>;
}

export class UserService implements IUserService {
    constructor(private userRepository: UserRepository) {}

    getUser = async (userNameOrEmail : string) =>{
        const isEmail = userNameOrEmail.includes('@');
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
        const tokenPayload = `${user.userName}_${user._id}`;
        let token : string;
        if (loginRequest.rememberMe) {
            token = await jwt.sign({ data: tokenPayload }, jwtSecret, { expiresIn: "168h" });
        } else {
            token = await jwt.sign({ data: tokenPayload }, jwtSecret, { expiresIn: "72h"});
        }
        
        const loginResponse : LoginResponse = {user, token};
        return loginResponse;
    }

    validateInfo = (user: Partial<UserToValidate>) => {
        const userNamePattern = /^(?!.{33})[a-zA-Z0-9_.]{8,}$/;
        if (!user.userName || !userNamePattern.test(user.userName)) {
            throw new HttpError(400, ErrorCode.INVALID_USERNAME, "Invalid username");
        }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!user.email || !emailPattern.test(user.email)) {
            throw new HttpError(400, ErrorCode.INVALID_EMAIL, "Invalid email");
        }
        if (!user.password || user.password.length < 8 || user.password.length > 32) {
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
        this.validateInfo(userToValidate);
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
            profilePicture: "",
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
}