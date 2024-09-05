import mongoose from "mongoose";

export const notificationSchema = new mongoose.Schema({
    eventId: {type: String, required: true},
    isMine: {type: Boolean, required: true},
    seen: {type: Boolean, required: true},
}, {
    timestamps: { createdAt: "creationDate", updatedAt: "updateDate" }
})