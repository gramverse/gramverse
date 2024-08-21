import mongoose from "mongoose";

export const commentSchema = new mongoose.Schema({
    userName: { type: String, required: true},
    comment: { type: String, required: true},
    postId: { type: String, required: true},
    parentCommentId: { type: String, required: false},
    isDeleted: {type: Boolean, required: true, default: false},
    }, {
    timestamps: { createdAt: "creationDate"}
})