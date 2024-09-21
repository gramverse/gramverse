import { UnknownError } from "../errors/http-error";
import { ChatRepository } from "../repository/chat.repository";
import { sortString } from "../utilities/sort-string";
import { UserRepService } from "./user.rep.service";

export class ChatService {
    constructor(private chatRepository: ChatRepository, private userRepService: UserRepService) {}

    createChat = async (myUserName: string, friendUserName: string) => {
        return await this.chatRepository.add(myUserName, friendUserName);
    }

    getChatList = async (userName: string, skip: number, limit: number) => {
        return await this.chatRepository.getList(userName, skip, limit);
    }

    getChat = async (userNameA: string, userNameB: string) => {
        const {result1: userName1, result2: userName2} = sortString(userNameA, userNameB);
        const existingchat = await this.chatRepository.getChat(userName1, userName2);
        let chatId = existingchat?._id;
        if (!chatId) {
            chatId = await this.createChat(userName1, userName2);
        }
        return chatId;
    }

    getChatById = async (chatId: string) => {
        return await this.chatRepository.getChatById(chatId);
    }

    getChatCount = async (userName: string) => {
        return await this.chatRepository.getChatCount(userName);
    }

    updateLasts = async(type: string, content: string, chatId: string, userName: string) => {
        await this.chatRepository.update(type,content,chatId,userName)
    }
}