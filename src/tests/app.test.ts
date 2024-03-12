import app from "../build/app";
import request from "supertest";
import { AppDataSource } from "../database/data-source";

beforeAll(async () => {
  await AppDataSource.initialize();
});

describe("GET /film", () => {
    test("/", async ()=>{
        const response = await request(app).get("/").send().expect(200).end(function(err, res) {
            if (err) throw err;
          });
        console.log(response)
    })
})

afterAll(async () => {
  await AppDataSource.dropDatabase();
});