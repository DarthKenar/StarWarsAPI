// TODO: 
// Test login
// getLogin //OK
// getRegister //OK
// postLogin
// postRegister
import supertest from "supertest";
import app from "../build/app";
import DataBase from "../database/data-source";
const request = supertest(app)

beforeAll(async ()=>{
    await DataBase.initialize()
})

describe("GET a formularios de registro y autentificación", () => {
    test("/auth/login", async ()=>{
        await request
        .get('/auth/login')
        .expect('Content-Type', /application\/json/)
        .expect(200)
    })
    test("/auth/register", async ()=>{
        await request
        .get("/auth/register")
        .expect('Content-Type', /application\/json/)
        .expect(200)
    })
})

afterAll(async () => {
    await DataBase.destroy();
});