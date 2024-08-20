import z from "zod"

export const zodPostRequest = z.object({
    userName: z.string().nonempty(),
    photoUrls: z.array(z.string()).nonempty(),  
    caption: z.string(),
    mentions: z.array(z.string()) 
});

export type PostRequest = z.infer<typeof zodPostRequest>
