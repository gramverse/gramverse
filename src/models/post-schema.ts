import mongoose from "mongoose";

export const postSchema = new mongoose.Schema({
    userName: {type: String, required: true},
    photos: {type: [String],required: true},
    caption: {type:String, default: ""},
    mentioned: {type: [String], required: true},
  }, { 
    timestamps: { createdAt: "created_time", updatedAt: "updated_time" }
});