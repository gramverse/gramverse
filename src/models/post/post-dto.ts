export type PostDto = {
    _id : String,
    userName : String,
    photos : String[],
    caption : String,
    mentions: String[],
    tags : String[]
    creationDate: Date,

}