export interface IMessage extends Message, Document {}

export interface Message {
    _id: string;
    chatId: string;
    senderUserName: string;
    receiverUserName: string;
    content: string;
    creationDate: Date;
    type: "text" | "image";
    seen: boolean;
}
