import mongoose from "mongoose";

export const followSchema = new mongoose.Schema({
    followerUserName: {type: String, required: true},
    followingUserName: {type: String, required: true},
    followRequestState: {type: String, default: "accepted"},
    isCloseFriend: {type: Boolean, default: false},
    isBlocked: {type: Boolean, default: false},
    isDeleted: {type: Boolean, default: false}
  }, { 
    timestamps: { createdAt: "created_time", updatedAt: "updated_time" }
  });