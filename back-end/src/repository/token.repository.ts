import mongoose, { Model } from "mongoose";
import { tokenSchema } from "../models/token-schema";
import { IToken, Token } from "../models/token";

export interface ITokenRepository {
    addToken: (token: Token) => Promise<Token | undefined>;
    updateToken: (token: Token) => Promise<Token | undefined>;
    getTokenByValue: (tokenValue: string) => Promise<Token | undefined>;
    markTokenAsUsed: (tokenValue: string) => Promise<void>;
    //deleteExpiredTokens: () => Promise<void>;
}

export class TokenRepository implements ITokenRepository {
    private tokens: Model<IToken>;
    
    constructor(private dataHandler: typeof mongoose) {
        this.tokens = dataHandler.model<IToken>("tokens", tokenSchema);
    }

    addToken = async (tokenData: Token) => {
        const createdDocument = await this.tokens.create(tokenData);
        if (!createdDocument) {
            return undefined;
        }
        return createdDocument.toObject();
    }

    updateToken = async (tokenData: Token) => {
        const updatedDocument = await this.tokens.updateOne({ token: tokenData.token }, tokenData);
        if (!updatedDocument.acknowledged) {
            return undefined;
        }
        return tokenData;
    }

    getTokenByValue = async (tokenValue: string) => {
        const token: Token | undefined = await this.tokens.findOne({ token: tokenValue }).lean() || undefined;
        return token;
    }

    markTokenAsUsed = async (tokenValue: string) => {
        await this.tokens.updateOne({ token: tokenValue }, { isUsed: true });
    }

    // deleteExpiredTokens = async () => {
    //     await this.tokens.deleteMany({ expireTime: { $lt: new Date() }, isUsed: false });
    // }
}
