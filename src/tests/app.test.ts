import app from "../build/app";
import supertest from "supertest";
import { AppDataSource } from "../database/data-source";

const request = supertest(app)

beforeAll(async () => {
  await AppDataSource.initialize();
});

describe("GET a la raiz", () => {
    test("/", async ()=>{
      await request
        .get('/')
        .expect('Content-Type', /application\/json/)
        .expect(200)
    })
})

describe("Peticiones GET para routes Film", () => {
  test("Comprueba si devuelve las 6 películas", async ()=>{
    let response = await request.get('/film/s/all')
    expect(response.body.results).toHaveLength(6)
  })
})

// describe("Peticiones GET para routes Film", () => {

//   test("Devuelve las películas coincidentes con un título", ()=>{
//     request
//       .get('/film/s/search')
//       .expect('Content-Type', /json/)
//       .expect(404)
//       .end(function(err, res) {
//         if (err) throw err;
//       });
//   })
//   test("Muestra todos los personajes relacionados con una película", ()=>{
//     request
//       .get('/film/1')
//       .expect('Content-Type', /json/)
//       .expect(200)
//       .end(function(err, res) {
//         if (err) throw err;
//       });
//   })
// })


afterAll(async () => {
  await AppDataSource.dropDatabase();
});