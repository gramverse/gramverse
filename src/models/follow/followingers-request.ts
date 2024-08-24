import { z } from "zod";

export const zodFollowingersRequest = z.object({
    userName: z.string().nonempty(),
    isFollowing: z.boolean(),
})

export type FollowingersRequest = z.infer<typeof zodFollowingersRequest>;