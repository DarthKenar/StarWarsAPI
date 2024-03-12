// import app from "../../src/build/server";
// import request from "supertest";
// import { TestDataSource } from "../database/data-source";

// Mock the entire AppDataSource module

// beforeAll(async () => {
//   await TestDataSource.initialize();
// });

// describe("GET /film", () => {
//     test("/", async ()=>{
//         const response = await request(app).get("/").send()
//         console.log(response)
//         expect(response.statusCode).toBe(200);
//     })
// })

// afterAll(async () => {
//   await TestDataSource.dropDatabase();
// });