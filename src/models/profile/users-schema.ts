import {Document} from "mongoose";

export const usersSchemaObject = {
    userName: {type: String, required: true},
    firstName: String,
    lastName: String,
    profileImage: String,
    email: {type: String, required: true},
    passwordHash: {type: String, required: true},
    isPrivate: {type: Boolean, required: true, default: false},
    bio: String,
};
