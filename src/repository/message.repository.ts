import {Model} from "mongoose";
import {messageSchema} from "../models/message/message-schema";
import {IMessage, Message} from "../models/message/message";
import {TypeOf} from "zod";
import { MessageType } from "../models/message/message-type";

export class MessagesRepository {
    private messages: Model<IMessage>;
    constructor(private datahandler: typeof import("mongoose")) {
        this.messages = datahandler.model<IMessage>("messages", messageSchema);
    }

    add = async (
        chatId: string,
        senderUserName: string,
        receiverUserName: string,
        content: string,
        type: MessageType,
    ) => {
        const createdMessage = await this.messages.create({
            chatId,
            senderUserName,
            receiverUserName,
            content,
            type,
            seen: false,
        });
        return createdMessage._id;
    };

    updateSeenStatus = async (idList: string[], seen: boolean) => {
        return await this.messages.updateMany({_id: {$in: idList}}, {seen});
    }

    getMessages = async (chatId: string, skip: number, limit: number) => {
        return await this.messages
            .find({chatId})
            .skip(skip)
            .limit(limit)
            .sort({creationDate: -1})
            .lean();
    };

    getUnreadCount = async (userName: string, chatId: string) => {
        return await this.messages.countDocuments({receiverUserName: userName, chatId, seen: false});
    }

    getMessageCountByChatId = async (chatId: string) => {
        return await this.messages.countDocuments({chatId});
    }

    getMessageById = async (_id: string) => {
        return await this.messages.findById(_id);
    }

    getTotalUnreadCount = async (receiverUserName: string) => {
        return await this.messages.countDocuments({receiverUserName, seen: false});
    }
}
