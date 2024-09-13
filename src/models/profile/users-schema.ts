import {Document} from "mongoose";

export const usersSchemaObject = {
    userName: {type: String, required: true},
    normalizedUserName: {type: String, required: true},
    email: {type: String, required: true},
    normalizedEmail: {type: String, required: true},
    firstName: {type: String, default: ""},
    lastName: {type: String, default: ""},
    profileImage: {type: String, default: ""},
    passwordHash: {type: String, required: true},
    isPrivate: {type: Boolean, required: true, default: false},
    bio: {type: String, default: ""},
    followerCount: {type: Number, default: 0},
};
