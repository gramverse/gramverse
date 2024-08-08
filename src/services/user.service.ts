import { UserRepository } from "../repository/user.repository";
import { HttpError } from "../errors/http-error";
import { ErrorCode } from "../errors/error-codes";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validateSignUpInput } from "../zod/validation"
import { config } from "../config";
import { IUserService } from "./user.service.interface";

export class UserService implements IUserService {
    constructor(private userRepository: UserRepository) {}

    signUp = async (userName: string, email: string, password: string) => {
        validateSignUpInput({ userName, email, password });

        const emailExists = await this.userRepository.checkEmailExistance(email);
        if (emailExists) {
            throw new HttpError(400, ErrorCode.USER_ALREADY_EXISTS);
        }

        const userNameExists = await this.userRepository.checkUserNameExistance(userName);
        if (userNameExists) {
            throw new HttpError(400, ErrorCode.USER_ALREADY_EXISTS);
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await this.userRepository.add({
            userName,
            email,
            passwordHash,
            isPublic: false, 
            bio: '',
            firstName: '',
            lastName: '',
            profilePicture: ''
        });

        const tokenPayload = `${user.userName}_${user._id}`;
        const token = jwt.sign({ data: tokenPayload }, process.env.JWT_SECRET as string, { expiresIn: '24h' });

        return { user, token };
    };

}
