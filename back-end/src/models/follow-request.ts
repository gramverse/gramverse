import z from "zod"

export const zodFollowRequest = z.object({
    followerUserName: z.string().nonempty(),
    followingUserName: z.string().nonempty(),
});

export type FollowRequest = z.infer<typeof zodFollowRequest>
