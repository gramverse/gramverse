import mongoose, { Model } from "mongoose";
import {usersSchemaObject} from "../models/users-schema";

export class UserRepository {
    private users: Model<any>;
    constructor(private dataHandler: typeof import("mongoose")) {
        const usersSchema = new mongoose.Schema(usersSchemaObject);
        this.users = dataHandler.model("users", usersSchema);
    }
}