import {z} from "zod";

export const zodBlockRequest = z.object({
    followerUserName: z.string().nonempty(),
    followingUserName: z.string().nonempty(),
    isBlock: z.boolean().default(true),
});
   