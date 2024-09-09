import {z} from "zod";

export const zodAcceptRequest = z.object({
    followerUserName: z.string().nonempty(),
    accepted: z.boolean(),
});
