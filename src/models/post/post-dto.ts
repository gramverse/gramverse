export type PostDto = {
    _id : String,
    userName : String,
    photoUrls: String[],
    caption : String,
    mentions: String[],
    tags : String[]
    creationDate: Date,

}