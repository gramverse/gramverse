export interface IPost extends Document {
    _id?: string;
    userName: string;
    photos: Array<{ url: string}>;
    caption?: string;
    mentioned: Array<string>
    
}

export interface Post {
    _id?: string;
    userName: string;
    photos: Array<{ url: string}>;
    caption?: string;
    mentioned: Array<string>
    
}

export interface PostToValidate {
    _id?: string;
    userName: string;
    photos: Array<{ url: string}>;
    caption?: string;
    mentioned: Array<string>
    
}