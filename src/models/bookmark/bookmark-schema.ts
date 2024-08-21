import mongoose from "mongoose";

export const bookmarkSchema = new mongoose.Schema ({
    userName: { type: String, required: true},
    postId: { type: String, required: true},
}, {
    timestamps: {createdAt: "creationDate"}
})