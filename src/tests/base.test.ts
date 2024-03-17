import DataBase from "../database/data-source";
import server from "../build/index"
import {createFilm, createPeople, createPeopleInFilms} from "./helpers";
import app from "../build/app";
import supertest from "supertest";

const request = supertest(app)

beforeAll(async ()=>{
    await DataBase.initialize()
})

describe("GET a la raíz", () => {
    test("/", async ()=>{
      await request
        .get('/')
        .expect('Content-Type', /application\/json/)
        .expect(200)
    })
})


afterAll(async () => {
    await DataBase.destroy();
});