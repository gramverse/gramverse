import mongoose from "mongoose";

export const mentionSchema = new mongoose.Schema(
    {
        userName: {type: String, required: true},
        postId: {type: String, required: true},
        isDeleted: {type: String, default: false},
    },
    {
        timestamps: {createdAt: "creationDate", updatedAt: "updateDate"},
    },
);
