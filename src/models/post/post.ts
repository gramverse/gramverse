export interface IPost extends Document {
    _id: string;
    userName: string;
    photos: string[];
    caption: string;
    mentions: string[];
    creationDate: Date,
}

export interface Post {
    _id: string;
    userName: string;
    photos: string[];
    caption: string;
    mentions: string[];
    creationDate: Date,
}


import z, { string } from 'zod'

export const zodPostDto = z.object({
    userName : z.string().nonempty(),
    photos : z.array(z.string()).nonempty(),
    caption : z.string(),
    mention: z.string().nonempty()
});

export type PostDto = z.infer<typeof zodPostDto>  