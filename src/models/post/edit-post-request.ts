import z from "zod"

export const zodEditPostRequest = z.object({
    _id: z.string(),
    userName: z.string().nonempty(),
    photoUrls: z.array(z.string()).nonempty(),  
    caption: z.string(),
    mentions: z.array(z.string()),
    forCloseFriends: z.boolean(),
});

export type EditPostRequest = z.infer<typeof zodEditPostRequest>
