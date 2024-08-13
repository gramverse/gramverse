import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    userName: {type: String, required:true},
    photos: {type:Array,required: true},
    caption: {type:String,default:""},
    mentioned: {type:Array,default:""},
  }, { 
    timestamps: { createdAt: "created_time", updatedAt: "updated_time" }
  });