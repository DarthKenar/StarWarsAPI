import app from "../build/app";
import supertest from "supertest";
import { AppDataSource } from "../database/data-source";
import server from "../build/index"
const request = supertest(app)

// beforeAll(async () => {
//   await AppDataSource.initialize();
// });

describe("GET a la raiz", () => {
    test("/", async ()=>{
      await request
        .get('/')
        .expect('Content-Type', /application\/json/)
        .expect(200)
    })
})

describe("Peticiones GET para routes Film", () => {
  //Devuelven 200
  test("Comprueba si devuelve las 6 películas", async ()=>{
    let response = await request.get('/film/s/all').expect(200)
    expect(response.body.results).toHaveLength(6)
  })
  test("Comprueba que se devuelva una película correctamente y esta tenga su valor characters en true, que indica que tiene personajes guardados y relacionados en la base de datos.", async () => {
    let response = await request.get('/film/1').expect(200)
    expect(response.body.film.characters).toBe(true)
  })
  // WIP
  // test("Comprueba que devuelva una lista de películas encontradas", async () => {
  //   let response = await request.get('/film/s/search').expect(404)
  //   expect(response.body.error).toBe("No se encontró la película 7.")
  // })
  //Devuelven Errores
  test("Comprueba que devuelva el error correcto, si se ingresan letras al pedir la lista de personajes de una película por id", async ()=>{
    let response = await request.get('/film/asd').expect(400)
    expect(response.body.error).toBe("La solicitud \"asd\" es incorrecta.")
  })
  test("Comprueba que devuelva el error correcto al ingresar una película que no existe.", async () => {
    let response = await request.get('/film/7').expect(404)
    expect(response.body.error).toBe("No se encontró la película 7.")
  })
})


afterAll(async () => {
  await AppDataSource.destroy();
  server.close()
});