import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { ITokenRepository } from "../repository/token.repository";
import { IUserRepository } from "../repository/user.repository";
import { IToken } from "../models/reset-password/token";
import { HttpError } from "../errors/http-error";
import { ErrorCode } from "../errors/error-codes";
import { Token } from "../models/reset-password/token";
import { User } from "../models/login/login-response";
import { ResetPasswordRequest } from "../models/reset-password/resetpassword-request";
import { EmailService } from "../utilities/nodemailer"; 
import { UserService } from "./user.service";
import { UserRepService } from "./userRep.service";

export interface IResetService {
    generateResetPasswordToken: (email: string) => Promise<void>;
    validateResetPasswordToken: (token: string) => Promise<void>;
    resetPassword: (resetPasswordRequest: ResetPasswordRequest) => Promise<void>;
}

export class ResetService implements IResetService {
    constructor(
        private tokenRepository: ITokenRepository,
        private userRepService: UserRepService,
        private emailService: EmailService
    ) {}

    generateResetPasswordToken = async (userName: string) => {
        const user = await this.userRepService.getUser(userName);
        if (!user) {
            throw new HttpError(404, ErrorCode.USER_NOT_FOUND, "User not found");
        }

        const tokenValue = uuidv4();  
        const expirationDate = new Date(Date.now() + 15 * 60 * 1000); 

        const tokenData: Token = {
            userName: user.userName ,
            token: tokenValue,
            expireTime: expirationDate,
            isUsed: false,
        };

        await this.tokenRepository.addToken(tokenData);


        await this.emailService.sendResetPasswordEmail(user.email, tokenValue);


        return ;  
    }

    validateResetPasswordToken = async (tokenValue: string) => {
        const token = await this.tokenRepository.getTokenByValue(tokenValue);

        if (!token || token.isUsed || new Date() > token.expireTime!) {
            throw new HttpError(400, ErrorCode.INVALID_OR_EXPIRED_TOKEN, "Token is invalid or expired");
        }
    }

    resetPassword = async (resetPasswordRequest: ResetPasswordRequest) => {
        const { token, newPassword } = resetPasswordRequest;

        await this.validateResetPasswordToken(token);

        const tokenData = await this.tokenRepository.getTokenByValue(token);
        if (!tokenData) {
            throw new HttpError(400, ErrorCode.INVALID_OR_EXPIRED_TOKEN, "Token is not valid");
        }
        const user = await this.userRepService.getUser(tokenData.userName);

        if (!user) {
            throw new HttpError(404, ErrorCode.USER_NOT_FOUND, "User not found");
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);
        
        user.passwordHash = passwordHash

        await this.userRepService.updateUser(user._id, user);
        await this.tokenRepository.markTokenAsUsed(token);
    }
}



