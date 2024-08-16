import mongoose from "mongoose";

export const tokenSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  token: { type: String, required: true },
  expireTime: { type: Date, required: true },
  isUsed: { type: Boolean, default: false },
  }, { 
    timestamps: { createdAt: "created_time", updatedAt: "used_time" }
  });


export const TokenModel = mongoose.model('Token', tokenSchema);