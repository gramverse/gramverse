export interface IBookmark extends Bookmark, Document {}

export interface Bookmark {
    _id: string;
    userName: string;
    postId: string;
    creationDate: Date;
    isDeleted: boolean;
}
