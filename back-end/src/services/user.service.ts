import { LoginRequest } from "/home/ali/FINALFINALPROJECT/collegegram-back-end/back-end/src/models/login-request.ts";
import {UserRepository} from "../repository/user.repository";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
export interface IUserRepository {
    // add: (registerRequest: RegisterRequest) => Promise<User>;
    // checkEmailExistance: (email: string) => Promise<boolean>;
    // checkUserNameExistance: (userName: string) => Promise<boolean>;
    // getUserByEmail: (email: string) => Promise<User|undefined>;
    // getUserByUsername: (userName: string) => Promise<User|undefined>;
}

export class UserService {
    constructor(private userRepository: UserRepository) {}
    getUser = async (userNameOrEmail : string) =>{
        let user ;
        const isEmail = userNameOrEmail.includes('@');
        if (isEmail === true ) {
            user = this.userRepository.getUserByEmail(userNameOrEmail);
            
            return user;
        } else {
            user = this.userRepository.getUserByUserName(userNameOrEmail);
            
            return user;
        }
    } 
    
    login = async (loginRequest : LoginRequest) => {
        const user = await this.getUser(loginRequest.userName);
        
        const userPassword = await bcrypt.hash(loginRequest.password, 10);
        if (!user){
            return undefined;
        } else if (bcrypt.compare(userPassword, user.password)){
            return 
        }

    }


}