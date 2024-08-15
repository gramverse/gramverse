import z from "zod"

export const zodPostRequest = z.object({
    userName: z.string().nonempty(),
    photos: z.array(z.string()).nonempty(),  
    caption: z.string(),
    mentioned: z.array(z.string()) 
});

export type PostRequest = z.infer<typeof zodPostRequest>
