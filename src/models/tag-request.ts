import z from "zod"

export const zodTagRequest = z.object({
    tag: z.string().nonempty(),
    postId: z.string().nonempty(),

});

export type TagRequest = z.infer<typeof zodTagRequest>
