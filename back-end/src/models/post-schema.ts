import mongoose from "mongoose";

export const postSchema = new mongoose.Schema({
    userName: {type: String, required:true},
    photos: {type:Array,required: true},
    caption: {type:String,default:""},
    mentioned: {type:String,default:""},
  }, { 
    timestamps: { createdAt: "created_time", updatedAt: "updated_time" }
});