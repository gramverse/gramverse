import mongoose from "mongoose";

export const tagSchema = new mongoose.Schema({
    postId: {type: String, required: true},
    tag: {type: String, required: true},
    isDeleted: {type: Boolean, required: true, default: false},
    likesCount: {type: Number, required: true, default: 0}

});
