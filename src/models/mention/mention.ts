export interface IMentiont extends Document {
    _id: string;
    userName: string;
    postId: string;
    isDeleted: boolean;
    creationDate: Date;
    updateDate: Date;
}

export interface Mention {
    _id: string;
    userName: string;
    postId: string;
    isDeleted: boolean;
    creationDate: Date;
    updateDate: Date;
}
