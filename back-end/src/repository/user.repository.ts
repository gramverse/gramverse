import mongoose, { Model } from "mongoose";
import {usersSchemaObject} from "../models/users-schema";

export interface IUserService {
    // signUp: (registerRequest: RegisterRequest) => Promise<Token>;
    // checkEmailExistance: (email: string) => Promise<boolean>;
    // checkUserNameExistance: (userName: string) => Promise<boolean>;
    // validateInfo: (user: User) => boolean;
    // login: (loginRequest: LoginRequest) => Promise<Token>;
    // getUser: (userNameOrPassword: string) => Promise<User>;
    // ... reset password functions
    // editProfile: (profile: Profile) => Promise<Profile>;
}

export class UserRepository {
    private users: Model<any>;
    constructor(private dataHandler: typeof import("mongoose")) {
        const usersSchema = new mongoose.Schema(usersSchemaObject);
        this.users = dataHandler.model("users", usersSchema);
    }
    getUserByUserName = async (userName : string) => {
        const user = await (this.users.find({userName : userName}));
        return user;     
    }
    getUserByEmail = async (email : string) =>{
        const user = await (this.users.find({email : email}));
        
        return user;

        }
    
}