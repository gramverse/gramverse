import mongoose from "mongoose";

const followSchema = new mongoose.Schema({
    followerUserName: {type: String, required: true},
    followingUserName: {type: String, required: true},
    isDeleted: {type: Boolean, required: true,default: false}
  }, { 
    timestamps: { createdAt: "created_time", updatedAt: "updated_time" }
  });