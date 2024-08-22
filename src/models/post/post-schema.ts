import mongoose from "mongoose";

export const postSchema = new mongoose.Schema({
    userName: {type: String, required: true},
    photoUrls: {type: [String],required: true},
    caption: {type:String, default: ""},
    mentions: {type: [String], required: true},
  }, { 
    timestamps: { createdAt: "creationDate", updatedAt: "updateDate" }
});