import supertest from "supertest";
import app from "../build/app";
import DataBase from "../database/data-source";
import { Auth } from "../database/entity/models";
const request = supertest(app)

beforeAll(async ()=>{
    await DataBase.initialize()
})

describe("GET a formularios de registro y autentificación", () => {
    test("getLogin - /auth/login", async ()=>{
        await request
        .get('/auth/login')
        .expect('Content-Type', /application\/json/)
        .expect(200)
    })
    test("getRegister - /auth/register", async ()=>{
        await request
        .get("/auth/register")
        .expect('Content-Type', /application\/json/)
        .expect(200)
    })
})
describe("POST en formularios de registro y autentificación con información del usuario", () => {
    test("postRegister - /auth/register/send", async ()=>{
        let response = await request.post("/auth/register/send").send({email: 'john@gmail.com',password: 'cabezón1234'})
        expect(200)
        expect(response.body).toHaveProperty("message")
        expect(response.body.message).toContain("El usuario se ha registrado correctamente.")
    })
    test("postLogin - /auth/login", async ()=>{
        let response = await request.post('/auth/login/send').send({email: 'john@gmail.com',password: 'cabezón1234'})
        expect(200)
        expect(response.body).toHaveProperty("message")
        expect(response.body.message).toContain("El usuario ha ingresado correctamente.")
    })
})

afterAll(async () => {
    await DataBase.getRepository(Auth).clear()
    await DataBase.destroy();
});