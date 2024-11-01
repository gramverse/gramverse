import mongoose from "mongoose";
import { IUser } from "../../models/login/login-response";
import { usersSchemaObject } from "../../models/profile/users-schema";
import { sampleUsers } from "./seed/user";
import { seeder } from "../../utilities/seeder";
import request  from "supertest";
import { buildApp } from "../../startup";

beforeAll(async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/GramverseTestDB");
});

afterAll(async() => {
    mongoose.disconnect();
});

const {app} = buildApp();
describe("users", () => {
    it("should signup with valid info", async () => {
        const credentials = {userName: "alireza", email: "alirezaizadi199912@gmail.com", password: "Ali12345"};
        const response = await request(app)
        .post("/api/users/signup")
        .send(credentials);
        expect(response.statusCode).toBe(200);
    });

    it("should fail if password is short", async () => {
        const credentials = {userName: "Alireza", email: "alirezaizadi199912@gmail.com", password: "Ali123"};
        const response = await request(app)
        .post("/api/users/signup")
        .send(credentials);
        expect(response.statusCode).toBe(400);
    });

    it("should fail if email format is invalid", async () => {
        const credentials = {userName: "alireza", email: "alirezaizadi199912gmail.com", password: "Ali12345"};
        const response = await request(app)
        .post("/api/users/signup")
        .send(credentials);
        expect(response.statusCode).toBe(400);
    });

    it("should fail if userName is short", async () => {
        const credentials = {userName: "Alex", email: "alirezaizadi199912@gmail.com", password: "Ali12345"};
        const response = await request(app)
        .post("/api/users/signup")
        .send(credentials);
        expect(response.statusCode).toBe(400);
    });

    it("should fail if userName is already taken (case-sensitive)", async () => {
        const credentials = {userName: "aliReza", email: "alirezaizadi199913@gmail.com", password: "Ali12345"};
        const response = await request(app)
        .post("/api/users/signup")
        .send(credentials);
        expect(response.statusCode).toBe(400);
    });

    it("should fail if email is already used (case-sensitive)", async () => {
        const credentials = {userName: "alireza2", email: "alirezaizadi199912@gmail.com", password: "Ali12345"};
        const response = await request(app)
        .post("/api/users/signup")
        .send(credentials);
        expect(response.statusCode).toBe(400);
    });

    it("should fail if a required field is missing(case-sensitive)", async () => {
        const credentials = {userName: "alireza2", password: "Ali12345"};
        const response = await request(app)
        .post("/api/users/signup")
        .send(credentials);
        expect(response.statusCode).toBe(400);
    });
})