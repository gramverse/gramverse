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
        const user =
            (await this.users.findOne({
                normalizedUserName: userName.toUpperCase(),
            })) || undefined;
        return convertType<User, IUser>(user);
    };

    getUserByEmail = async (email: string) => {
        const user =
            (await this.users.findOne({
                normalizedEmail: email.toUpperCase(),
            })) || undefined;
        return convertType<User, IUser>(user);
    };

    checkUserNameExistance = async (userName: string) => {
        const user = await this.users.findOne({
            normalizedUserName: userName.toUpperCase(),
        });
        return !!user;
    };

    checkEmailExistance = async (email: string) => {
        const user = await this.users.findOne({
            normalizedEmail: email.toUpperCase(),
        });
        return !!user;
    };

    update = async (userName: string, user: Partial<User>) => {
        await this.users.updateOne({userName}, user);
    };

    getAllUsers = async () => {
        return await this.users.find().lean();
    };
    searchAccount = async (
        userName: string,
        myUserName: string,
    ) => {
        const results = await this.users.aggregate([
            {
                $match: {
                    $and: [
                        {userName: {$ne: myUserName}},
                        {
                            $or: [
                                {userName: {$regex: userName, $options: "i"}},
                                {
                                    $expr: {
                                        $regexMatch: {
                                            input: {
                                                $concat: [
                                                    "$firstName",
                                                    " ",
                                                    "$lastName",
                                                ],
                                            },
                                            regex: userName,
                                            options: "i",
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            },
            {
                $group: {
                    _id: "$userName",
                    userName: {$first: "$userName"},
                    firstName: {$first: "$firstName"},
                    lastName: {$first: "$lastName"},
                    fullName: {
                        $first: {$concat: ["$firstName", " ", "$lastName"]},
                    },
                    profileImage: {$first: "$profileImage"},
                    followerCount: {$first: "$followerCount"},
                },
            },
            {
                $sort: {followerCount: -1, _id: 1},
            },
        ]);

        return results;
    };

    accountCount = async (searchTerm: string) => {
        const count = await this.users.aggregate([
            {
                $match: {
                    $or: [
                        {userName: {$regex: searchTerm, $options: "i"}},
                        {
                            $expr: {
                                $regexMatch: {
                                    input: {
                                        $concat: [
                                            "$firstName",
                                            " ",
                                            "$lastName",
                                        ],
                                    },
                                    regex: searchTerm,
                                    options: "i",
                                },
                            },
                        },
                    ],
                },
            },
            {
                $count: "totalCount",
            },
        ]);

        return count.length > 0 ? count[0].totalCount : 0;
    };
}
