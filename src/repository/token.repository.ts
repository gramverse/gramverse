import mongoose, {Model} from "mongoose";
import {tokenSchema} from "../models/reset-password/token-schema";
import {IToken, Token} from "../models/reset-password/token";
import { convertType } from "../utilities/convert-type";

export class TokenRepository {
    private tokens: Model<IToken>;

    constructor(private dataHandler: typeof mongoose) {
        this.tokens = dataHandler.model<IToken>("tokens", tokenSchema);
    }

    addToken = async (tokenData: Token) => {
        const createdDocument = await this.tokens.create(tokenData);
        return createdDocument._id;
    };

    updateToken = async (tokenData: Token) => {
        await this.tokens.updateOne(
            {token: tokenData.token},
            tokenData,
        );
    };

    getTokenByValue = async (tokenValue: string) => {
        const token =
            await this.tokens.findOne({token: tokenValue});
        return convertType<Token, IToken>(token);
    };

    markTokenAsUsed = async (tokenValue: string) => {
        await this.tokens.updateOne({token: tokenValue}, {isUsed: true});
    };

    // deleteExpiredTokens = async () => {
    //     await this.tokens.deleteMany({ expireTime: { $lt: new Date() }, isUsed: false });
    // }
}
