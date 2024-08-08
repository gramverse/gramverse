import mongoose, { Model } from "mongoose";
import { usersSchemaObject } from "../models/users-schema"
import { IUserRepository } from "./user.repository.interface";

export class UserRepository implements IUserRepository {
    private users: Model<any>;

    constructor(private dataHandler: typeof import("mongoose")) {
        const usersSchema = new mongoose.Schema(usersSchemaObject);
        this.users = dataHandler.model("users", usersSchema);
    }

    add = async (user: any) => {
        return this.users.create(user);
    };

    checkEmailExistance = async (email: string) => {
        const user = await this.users.findOne({ email });
        return !!user;
    };

    checkUserNameExistance = async (userName: string) => {
        const user = await this.users.findOne({ userName });
        return !!user;
    };

    getUserByEmail = async (email: string) => {
        return this.users.findOne({ email });
    };

    getUserByUsername = async (userName: string) => {
        return this.users.findOne({ userName });
    };
}
