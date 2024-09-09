export type PostDto = {
    _id: string;
    userName: string;
    photoUrls: string[];
    caption: string;
    mentions: string[];
    forCloseFriends: boolean;
    tags: string[];
    creationDate: Date;
};
