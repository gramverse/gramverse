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
    searchAccount = async (userName: string, skip: number, limit: number) => {
        const results = await this.users.aggregate([
            {
                $match: {
                    $or: [
                        { userName: { $regex: userName, $options: 'i' } },
                        { 
                            $expr: {
                                $regexMatch: {
                                    input: { $concat: ["$firstName", " ", "$lastName"] },
                                    regex: userName,
                                    options: "i"
                                }
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    _id: 0,
                    accountId: "$_id",
                    userName: 1,
                    firstName: 1,
                    lastName: 1,
                    fullName: { $concat: ["$firstName", " ", "$lastName"] },
                    profileImage: 1,
                    followerCount: 1
                }
            },
            {
                $sort: { likeCount: -1 }
            },
            {
                $skip: skip 
            },
            {
                $limit: limit 
            }
        ]);
        
        return results;
    };
    accountCount = async (searchTerm: string) => {
        const count = await this.users.aggregate([
            {
                $match: {
                    $or: [
                        { userName: { $regex: searchTerm, $options: 'i' } },
                        { 
                            $expr: {
                                $regexMatch: {
                                    input: { $concat: ["$firstName", " ", "$lastName"] },
                                    regex: searchTerm,
                                    options: "i"
                                }
                            }
                        }
                    ]
                }
            },
            {
                $count: "totalCount"
            }
        ]);
    
        return count.length > 0 ? count[0].totalCount : 0;
    };
    
    
}
