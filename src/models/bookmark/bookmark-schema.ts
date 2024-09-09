import mongoose from "mongoose";

export const bookmarkSchema = new mongoose.Schema(
    {
        userName: {type: String, required: true},
        postId: {type: String, required: true},
        isDeleted: {type: Boolean, default: false},
    },
    {
        timestamps: {createdAt: "creationDate", updatedAt: "updateDate"},
    },
);
