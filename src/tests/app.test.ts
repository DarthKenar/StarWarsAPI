import app from "../build/app";
import request from "supertest";
import { AppDataSource } from "../database/data-source";

beforeAll(async () => {
  await AppDataSource.initialize();
});

describe("GET a la raiz", () => {
    test("/", async ()=>{
      request(app)
      .get('/')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) throw err;
      });
    })
})

describe("Peticiones GET para routes Film", () => {
  test("Devuelve todas las películas", ()=>{
    request(app)
    .get('/film/s/all')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      if (err) throw err;
    });
  })
  test("Devuelve las películas coincidentes con un título", ()=>{
    request(app)
    .get('/film/s/search')
    .expect('Content-Type', /json/)
    .expect(404)
    .end(function(err, res) {
      if (err) throw err;
    });
  })
  test("Muestra todos los personajes relacionados con una película", ()=>{
    request(app)
    .get('/film/1')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      if (err) throw err;
    });
  })
})


afterAll(async () => {
  await AppDataSource.dropDatabase();
});