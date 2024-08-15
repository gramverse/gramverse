export interface IPost extends Document {
    _id: string;
    userName: string;
    photos: string[];
    caption: string;
    mentioned: string[];
}

export interface Post {
    _id: string;
    userName: string;
    photos: string[];
    caption: string;
    mentioned: string[];
}
