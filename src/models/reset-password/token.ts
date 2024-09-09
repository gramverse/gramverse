export interface IToken extends Document {
    token: string;
    userName: string;
    createTime?: Date;
    expireTime?: Date;
    isUsed: boolean;
}

export type Token = {
    token: string;
    userName: string;
    createTime?: Date;
    expireTime?: Date;
    isUsed: boolean;
};
