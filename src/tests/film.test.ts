import app from "../build/app";
import supertest from "supertest";
import { AppDataSource } from "../database/data-source";
import server from "../build/index"
const request = supertest(app)


describe("GET a la raiz", () => {
    test("/", async ()=>{
      await request
        .get('/')
        .expect('Content-Type', /application\/json/)
        .expect(200)
    })
})

describe("Peticiones GET para routes Film", () => {
  //200
  test("getFilmsAll - Comprueba si devuelve las 6 películas", async ()=>{
    let response = await request.get('/film/s/all').expect(200)
    expect(response.body.results).toHaveLength(6)
  })
  test("getFilmById - Comprueba que se devuelva una película correctamente y esta tenga su valor characters en true, que indica que tiene personajes guardados y relacionados en la base de datos.", async () => {
    let response = await request.get('/film/1').expect(200)
    expect(response.body.film.characters).toBe(true)
  })
  test("getFilmsByName - Comprueba que devuelva una lista con 4 resultados", async () => {
    let response = await request.get('/film/s/search').query({ searchFilm: 'a'}).expect(200)
    expect(response.body.results.length).toBe(4)
  })
  //4XX
  test("getFilmById - Comprueba que devuelva el error correcto, si se ingresan letras al pedir la lista de personajes de una película por id", async ()=>{
    let response = await request.get('/film/asd').expect(400)
    expect(response.body).toHaveProperty("error")
  })
  test("getFilmById - Comprueba que devuelva el error correcto al ingresar una película que no existe.", async () => {
    let response = await request.get('/film/7').expect(404)
    expect(response.body).toHaveProperty("error")
  })
  test("getFilmsByName - Comprueba que devuelva un error en el que no coincide ninguna película con el título buscado", async () => {
    let response = await request.get('/film/s/search').query({ searchFilm: 'qwerty'}).expect(404)
    expect(response.body).toHaveProperty("error")
  })
})


afterAll(async () => {
  await AppDataSource.destroy();
  server.close()
});