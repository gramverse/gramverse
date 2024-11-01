import mongoose from "mongoose";
import { seeder } from "../../utilities/seeder";
import { userRepService } from "../../config";

module.exports = async function (globalConfig: any, projectConfig: any) {
    await mongoose.connect("mongodb://127.0.0.1:27017/GramverseTestDB");
    await seeder();
    await mongoose.disconnect();
};