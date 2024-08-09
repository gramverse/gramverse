import mongoose, { Model } from "mongoose";
import {usersSchemaObject} from "../models/users-schema";
import { User, IUser } from "../models/login-response";


export interface IUserRepository {
    add: (user: User) => Promise<User|undefined>;
    checkEmailExistance: (email: string) => Promise<boolean>;
    checkUserNameExistance: (userName: string) => Promise<boolean>;
    getUserByEmail: (email: string) => Promise<User|undefined>;
    getUserByUserName: (userName: string) => Promise<User|undefined>;
}

export class UserRepository implements IUserRepository {
    private users: Model<IUser>;
    constructor(private dataHandler: typeof import("mongoose")) {
        const usersSchema = new mongoose.Schema(usersSchemaObject);
        this.users = dataHandler.model<IUser>("users", usersSchema);
    }

    add = async (user: User) => {
        const createdDocument = await this.users.create(user);
        if (!createdDocument) {
            return undefined;
        }
        const newUser: User = createdDocument;
        return newUser;
    }

    getUserByUserName = async (userName : string) => {
        const user: User|undefined = await this.users.findOne({userName})||undefined;
        return user;     
    }

    getUserByEmail = async (email : string) =>{
        const user: User|undefined = await this.users.findOne({email})||undefined;
        return user;
    }

    checkUserNameExistance = async (userName : string) => {
        const user = await this.users.findOne({userName});
        return !!user;     
    }

    checkEmailExistance = async (email : string) =>{
        const user = await this.users.findOne({email});
        return !!user;
    }
}