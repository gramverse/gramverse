import {z} from "zod";

export const zodCloseFriendRequest = z.object({
    userName: z.string(),
    isAdd: z.boolean(),
});
