import { z } from "zod";

export const zodGetMessagesRequest = z.object({
    chatId: z.string(),
    page: z.coerce.number(),
    limit: z.coerce.number(),
});
