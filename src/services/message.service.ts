import { NotFoundError, UnknownError } from "../errors/http-error";
import { Message } from "../models/message/message";
import {MessageDto, MessageRequest} from "../models/message/message-request";
import { MessageType } from "../models/message/message-type";
import {MessagesRepository} from "../repository/message.repository";
import { messageRouter } from "../routes/message.router";
import { ChatService } from "./chat.service";
import { UserRepService } from "./user.rep.service";

export class MessageService {
    constructor(private messageRepository: MessagesRepository, private userRepService: UserRepService, private chatService: ChatService) {}

    createMessage = async (
        chatId: string,
        senderUserName: string,
        content: string,
        type: MessageType,
    ) => {
        const chat = await this.chatService.getChatById(chatId);
        if (!chat) {
            throw new NotFoundError("chat");
        }
        const {userName1, userName2} = chat;
        if (senderUserName != userName1 && senderUserName != userName2) {
            throw new Error("Invalid chat id");
        }
        const receiverUserName = (senderUserName == userName1 ? userName2 : userName1).toString();
        const messageId = (await this.messageRepository.add(chatId, senderUserName, receiverUserName, content, type)).toString();
        return {messageId, receiverUserName};
    };

    markMessagesAsSeen = async (userName: string, idList: string[]) => {
        const verifiedIdList: string[] = [];
        for (const id of idList) {
            const message = await this.messageRepository.getMessageById(id);
            if (!message
                || message.receiverUserName != userName
            ) {
                continue;
            }
            verifiedIdList.push(id);
        }
        await this.messageRepository.updateSeenStatus(verifiedIdList, true);
    };

    getMessages = async (chatId: string, page: number, limit: number) => {
        const skip = (page-1) * limit;
        const messages: Message[] = await this.messageRepository.getMessages(
            chatId,
            skip,
            limit,
        );
        const messageDtos = [];
        for (const message of messages) {
            const {_id: messageId, chatId, type, senderUserName: userName, content, seen, creationDate: date} = message;
            const messageDto = {
                messageId,
                chatId,
                userName,
                type,
                content,
                seen,
                date,
            };
            messageDtos.push(messageDto);
        }
        const totalCount = await this.messageRepository.getMessageCountByChatId(chatId);
        return {messages: messageDtos, totalCount};
    };

    getChatDetail = async(userName: string, chatId: string) => {
        const chat = await this.chatService.getChatById(chatId);
        if (!chat) {
            throw new NotFoundError("chat");
        }
        if (userName != chat.userName1
            && userName != chat.userName2
        ) {
            throw new UnknownError();
        }
        const friendUserName = (chat.userName1 == userName ? chat.userName2 : chat.userName1).toString();
        const unreadCount = await this.messageRepository.getUnreadCount(userName, chatId);
        const totalCount = await this.messageRepository.getMessageCountByChatId(chatId);
        const user = await this.userRepService.getUser(friendUserName);
        if (!user ) {
            throw new UnknownError();
        }
        const profileImage = user.profileImage;
        return {totalCount, unreadCount, profileImage, friendUserName};
    }

    chatList = async(userName: string, page: number, limit: number) =>{
        const skip = (page -1) * limit
        const chats = await this.chatService.getChatList(userName,skip,limit);
        const chatDtos = [];
        for (const chat of chats) {
            const contactUserName = (chat.userName1 == userName ? chat.userName2 : chat.userName1).toString();
            const contactUser = await this.userRepService.getUser(contactUserName);
            if (!contactUser) {
                throw new UnknownError();
            }
            const {profileImage} = contactUser;
            const {_id, lastContent: lastMessage, lastType: lastMessageType, lastUpdated: lastMessageTime} = chat;
            const unreadCount = await this.messageRepository.getUnreadCount(chat._id, userName);
            const chatDto = {
                _id,
                userName: contactUserName,
                lastMessage,
                lastMessageType,
                lastMessageTime,
                profileImage,
                unreadCount,
            };
            chatDtos.push(chatDto);
        }
        const totalCount = await this.chatService.getChatCount(userName);
        return {chats: chatDtos, totalCount};
    }

    getTotalUnreadCount = async (userName: string) => {
        return await this.messageRepository.getTotalUnreadCount(userName);
    }
}
