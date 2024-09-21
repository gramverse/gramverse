import {Server, Socket} from "socket.io";
import {chatService, messageService} from "../config";
import {MessageRequest} from "../models/message/message-request";
import {tokenExtracter} from "../utilities/token-extracter";
import cookie from "cookie";
import {AuthorizationError} from "../errors/http-error";

export class MessageController {
    constructor(private io: Server) {}

    async handleConnection(socket: Socket) {
        if (!socket.handshake.headers.cookie) {
            throw new AuthorizationError();
        }
        const cookies = cookie.parse(socket.handshake.headers.cookie);
        const bearerToken = cookies["bearer"];
        if (!bearerToken) {
            throw new AuthorizationError();
        }
        const userName = (await tokenExtracter(bearerToken))?.currentUser
            .userName;

        if (!userName) {
            throw new AuthorizationError();
        }

        socket.join(userName);

        socket.on(
            "sendMessage",
            async ({chatId, content, type}, callback) => {
                try {
                    const {messageId, receiverUserName} = (await messageService.createMessage(
                        chatId,
                        userName,
                        content,
                        type,
                    ));
                    await chatService.updateLasts(type, content, chatId, userName);
                    this.io.to(receiverUserName).emit("receiveMessage", {
                        messageId,
                        chatId,
                        userName,
                        content,
                        type,
                        seen: false,
                        date: new Date(),
                    });
                    callback(messageId);
                    socket.emit("messageSent", {messageId, content, type});
                } catch (error) {
                    console.error("Error sending message:", error);
                }
            },
        );

        socket.on("messageSeen", async ({idList, senderUserName}) => {
            try {
                await messageService.markMessagesAsSeen(userName, idList);

                this.io.to(senderUserName).emit("receiveMessageSeen", idList);
            } catch (error) {
                console.log("error marking message as seen ", error);
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    }
}
