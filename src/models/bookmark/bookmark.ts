export interface IBookmark extends Document {
    _id: string;
    userName: string;
    postId: string;
    creationDate: Date;
    isDeleted: boolean;
}
export interface Bookmark {
    _id: string;
    userName: string;
    postId: string;
    creationDate: Date;
    isDeleted: boolean;
}