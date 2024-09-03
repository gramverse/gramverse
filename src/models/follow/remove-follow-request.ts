import { z } from "zod";

export const zodRemoveFollowRequest = z.object({
    followingUserName: z.string().nonempty(),
    followerUserName: z.string().nonempty(),
})

export type RemoveFollowRequest = z.infer<typeof zodRemoveFollowRequest>