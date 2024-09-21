import {z} from "zod";

export const zodChatRequest = z.object({
    userName: z.coerce.string().nonempty(),
    page: z.coerce.number(),
    limit: z.coerce.number(),
});
