import mongoose from "mongoose";
import { IUser } from "../models/login/login-response";
import { usersSchemaObject } from "../models/profile/users-schema";
import { sampleUsers } from "../tests/e2e/seed/user";
import { userRepService } from "../config";

export const seeder = async () => {
    await userRepService.seedData(sampleUsers);
}