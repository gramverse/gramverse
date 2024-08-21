import mongoose from "mongoose"

export const likeSchema = new mongoose.Schema({
    userName: { type: String, required: true},
    postId: {type: String, required: true},
    isDeleted: {type: Boolean, default: false, required: true}
}, { 
    timestamps: { createdAt: "creationDate"}
  })
