import mongoose from "mongoose";
import {buildApp} from "./startup";

export const {app, server} = buildApp(); // Get both the app and server
const port = process.env.PORT || 3000;

// Start the server
server.listen(3030, () => {
    app.listen(port, () => {
        console.log("app started");
    });
    console.log(`Listening on port ${port}`);
    console.log(
        `Swagger UI available at http://${process.env.APP_DOMAIN}:${port}/api/api-docs`,
    );
});

// MongoDB connection
let connectionString: string|undefined;
if (process.env.NODE_ENV == "test") {
    connectionString = "mongodb://mongo:27017/GramverseTestDB";
} else {
    connectionString = process.env.DB_CONNECTION_STRING;
}
if (!connectionString) {
    throw new Error("Connection string is not set.");
}

mongoose
    .connect(connectionString)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error(`Error connecting to MongoDB: ${err}`);
    });
