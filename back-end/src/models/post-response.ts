export interface IPost extends Document {
    _id?: string;
    userName: string;
    photos: Array<string>;
    caption?: string;
    mentioned: Array<string>
}

export interface Post {
    _id?: string;
    userName: string;
    photos: Array<string>
    caption?: string;
    mentioned: Array<string>
}
