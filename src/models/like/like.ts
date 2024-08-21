export interface ILike extends Document {
    _id: string;
    userName: string;
    postId: string;
    isDeleted: boolean;
    creationDate: Date;
}
export interface Like {
    _id: string;
    userName: string;
    postId: string;
    isDeleted: boolean;
    creationDate: Date;
}


