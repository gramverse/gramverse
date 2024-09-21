import mongoose, { Model } from "mongoose";
import { Chat, IChat } from "../models/message/chat";
import { chatSchema } from "../models/message/chat-schema";
import { sortString } from "../utilities/sort-string";
import { MessageType } from "../models/message/message-type";

export class ChatRepository {
    private chats: Model<IChat>;

    constructor(private dataHandler: typeof mongoose) {
        this.chats = dataHandler.model<IChat>("chats", chatSchema);
    }

    add = async (userNameA: string,userNameB:string) => {
        const {result1: userName1, result2: userName2} = sortString(userNameA, userNameB);
        const newChat: Partial<Chat> = {
            userName1,
            userName2,
            lastContent: "No chats yet",
            lastType: MessageType.TEXT,
            lastUserName: userName1,
        };
        const createdChat = await this.chats.create(newChat);
        return createdChat._id;
    }

    update = async (lastType: string, lastContent: string, chatId: string, lastUserName: string) => {
        const result = await this.chats.updateOne(
            { _id: chatId }, 
            {
                $set: {
                    lastType,
                    lastContent,
                    lastUserName,
                }
            }
        );
    
        return result;
    }
    getList = async (userName: string, skip: number, limit: number) => {
    
        const chatList = await this.chats.find({
            $or: [
                { userName1: userName },
                { userName2: userName }
            ]
        })
        .sort({ lastUpdated: -1 })
        .skip(skip)  
        .limit(limit); 
    
        return chatList;
    
    }

    getChatCount = async (userName: string) => {
        return await this.chats.countDocuments({
            $or: [
                { userName1: userName },
                { userName2: userName }
            ]
        })
    }

    getChat = async (userName1: string, userName2: string) => {
        return await this.chats.findOne({userName1, userName2});
    }

    getChatById = async (_id: string) => {
        return await this.chats.findById(_id);
    }
}