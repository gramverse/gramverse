import mongoose, {Model} from "mongoose";
import {usersSchemaObject} from "../models/profile/users-schema";
import {User, IUser} from "../models/login/login-response";
import {object} from "zod";
import {convertType} from "../utilities/convert-type";

export class UserRepository {
    private users: Model<IUser>;
    constructor(private dataHandler: typeof import("mongoose")) {
        const usersSchema = new mongoose.Schema(usersSchemaObject);
        this.users = dataHandler.model<IUser>("users", usersSchema);
    }

    add = async (user: Partial<User>) => {
        const createdUser = await this.users.create(user);
        return createdUser._id;
    };

    getUserByUserName = async (userName: string) => {
        const user = (await this.users.findOne({normalizedUserName: userName.toUpperCase()})) || undefined;
        return convertType<User, IUser>(user);
    };

    getUserByEmail = async (email: string) => {
        const user = (await this.users.findOne({normalizedEmail: email.toUpperCase()})) || undefined;
        return convertType<User, IUser>(user);
    };

    checkUserNameExistance = async (userName: string) => {
        const user = await this.users.findOne({normalizedUserName: userName.toUpperCase()});
        return !!user;
    };

    checkEmailExistance = async (email: string) => {
        const user = await this.users.findOne({normalizedEmail: email.toUpperCase()});
        return !!user;
    };

    update = async (userName: string, user: Partial<User>) => {
        await this.users.updateOne({userName}, user);
    };

    getAllUsers = async () => {
        return await this.users.find().lean();
    };
}
