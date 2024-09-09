import { User } from "../models/login/login-response";
import { UserRepository } from "../repository/user.repository";

export class UserRepService {
    constructor(private userRepository: UserRepository) {}

    createUser = async (user: User) => {
        return await this.userRepository.add(user);
    }
    
    getUser = async (userNameOrEmail : string) =>{
        const isEmail = userNameOrEmail.includes("@");
        let user ;
        if (isEmail) {
            user = await this.userRepository.getUserByEmail(userNameOrEmail);
        } else {
            user = await this.userRepository.getUserByUserName(userNameOrEmail);
        }
        return user;
    } 

    checkEmailExistance = async (email: string) => {
        return await this.userRepository.checkEmailExistance(email);
    }

    checkUserNameExistance = async (userName: string) => {
        return await this.userRepository.checkUserNameExistance(userName);
    }

    updateUser = async (_id: string, user: Partial<User>) => {
        return await this.userRepository.update(_id, user);
    }
}