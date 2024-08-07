import dotenv from "dotenv";
import mongoose from "mongoose";
import {buildApp} from "./startup";

dotenv.config();

export const app = buildApp();
const port = process.env.port || 3000;

const connectionString = process.env.DB_CONNECTION_STRING;
if (!connectionString) {
    throw new Error("Connection string is not set.");
}
mongoose.connect(connectionString)
.then(() => {
    console.log("Connected to mongo");
    app.listen(port, () => {
        console.log(`Listening on port ${port}`);
    });
}).catch(err => {
    console.error(`Error connecting to Mongo DB. ${err}`);
});