import mongoose from "mongoose";

export const commentsLikeSchema = new mongoose.Schema({
    userName: {type: String, required: true},
    commentId: {type: String, required: true},
    isDeleted: {type: Boolean, required: true, default: false},
}, {
    timestamps: { createdAt: "creationDate"}
})