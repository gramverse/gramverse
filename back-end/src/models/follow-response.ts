export interface IFollow extends Document {
    _id?: string;
    followerUserName: string
    followingUserName: string
    created_time: Date
    updated_time: Date
}

export interface Follow {
    _id?: string;
    followerUserName: string;
    followingUserName: string;
    created_time: Date
    updated_time: Date
}
