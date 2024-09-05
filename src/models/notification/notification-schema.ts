import mongoose from "mongoose";

export const notificationSchema = new mongoose.Schema({
    userName: {type: String, required: true},
    eventId: {type: String, required: true},
    isMine: {type: Boolean, required: true},
    seen: {type: Boolean, required: true,default: false},
}, {
    timestamps: { createdAt: "creationDate", updatedAt: "updateDate" }
})