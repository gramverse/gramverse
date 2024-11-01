import mongoose from "mongoose";

module.exports = async function (globalConfig: any, projectConfig: any) {
    await mongoose.connect("mongodb://127.0.0.1:27017/GramverseTestDB");
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
};