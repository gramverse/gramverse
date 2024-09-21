import mongoose from "mongoose";

export const messageSchema = new mongoose.Schema(
    {
        chatId: {type: String, required: true},
        senderUserName: {type: String, required: true},
        receiverUserName: {type: String, required: true},
        seen: {type: Boolean, default: false},
        content: {type: String, required: true},
        type: {type: String, required: true},
    },
    {
        timestamps: {createdAt: "creationDate"},
    },
);



//messageSchema.index({ chatId: 1 });
//messageSchema.index({ senderUserName: 1 });

// const Message = mongoose.model('Messages', messageSchema);
// module.exports = Message;
