import z from "zod";
import { MessageType } from "./message-type";

export const zodMessageRequest = z.object({
    senderUserName: z.string(),
    receiverUserName: z.string(),
    content: z.string(),
    type: z.string(),
});

export type MessageRequest = z.infer<typeof zodMessageRequest>;

export type MessageDto = {
    chatId: string;
    senderUserName: string;
    receiverUserName: string;
    seen: boolean;
    content: string;
    type: MessageType;
};
