import mongoose from "mongoose";

export const chatSchema = new mongoose.Schema(
    {
        userName1: {type: String, required: true},
        userName2: {type: String, required: true},
        lastContent: {type: String, required: true},
        lastType: {type: String, required: true},
        lastUserName: {type: String, required: true}
    },
    {
        timestamps: {createdAt: "creationDate",updatedAt: "lastUpdated"},
    },
);


//chatSchema.index({ user1Id: 1 });
//chatSchema.index({ user2Id: 1 });

// const Chat = mongoose.model('Chats', chatSchema);
// module.exports = Chat;