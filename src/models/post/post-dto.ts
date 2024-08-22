export type PostDto = {
    _id : string,
    userName : string,
    photoUrls: string[],
    caption: string,
    mentions: string[],
    tags: string[]
    creationDate: Date,
}