import mongoose from "mongoose";

export const eventSchema = new mongoose.Schema({
    performerUserName : {type: String, required: true},
    targetId : {type: String, required: true},
    type: {type: String, required: true},
}, {
    timestamps: { createdAt: "creationDate", updatedAt: "updateDate" }
})

