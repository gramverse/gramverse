export interface ITag extends Document {
    _id: string;
    tag: string;
    postId: string;
    isDeleted: boolean;
    likesCount: number;
}

export interface Tag {
    _id: string;
    tag: string;
    postId: string;
    isDeleted: boolean;
    likesCount: number;
}
