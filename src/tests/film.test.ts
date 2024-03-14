import app from "../build/app";
import supertest from "supertest";
import DataBase from "../database/data-source";
import server from "../build/index"
import {createFilm, createPeople, createPeopleInFilms} from "./helpers";

const request = supertest(app)

beforeAll(async ()=>{
  await DataBase.initialize()
  await createFilm()
  await createPeopleInFilms()
  await createPeople()
})

describe("GET a la raiz", () => {
    test("/", async ()=>{
      await request
        .get('/')
        .expect('Content-Type', /application\/json/)
        .expect(200)
    })
})

describe("Peticiones GET para routes Film", () => {
  //2XX
  test("getFilmsAll - Comprueba si devuelve las 6 películas, más la que nosotros hemos creado para el entorno de pruebas", async ()=>{
    let response = await request.get('/film/s/all').expect(200)
    expect(response.body.results).toHaveLength(7)
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

describe("Peticiones GET para routes Film",()=>{
  //2XX
  test("delFilmById - Comprueba que se eliminen los personajes realcionados con una película.", async () => {
    let response = await request.delete('/film/del/100').expect(200)
    expect(response.body).toHaveProperty("message")
  })
  //4XX
  test("delFilmById - Comprueba que deuelva un error al no encontrar una película para eliminar buscando por string", async () => {
    let response = await request.delete('/film/del/qwerty').expect(400)
    expect(response.body).toHaveProperty("error")
    expect(response.body.error).toContain("La solicitud \"qwerty\" es incorrecta.")
  })
  test("delFilmById - Comprueba que deuelva un error al no encontrar personajes para una película", async () => {
    let response = await request.delete('/film/del/2').expect(404)
    expect(response.body).toHaveProperty("error")
    expect(response.body.error).toContain("La película The Empire Strikes Back, no tiene personajes asociados para eliminar.")
  })
  test("delFilmById - Comprueba que deuelva un error al no encontrar una película", async () => {
    let response = await request.delete('/film/del/22').expect(404)
    expect(response.body).toHaveProperty("error")
    expect(response.body.error).toContain("La película con id 22 para eliminar, no se encuentra.")
  })
})


afterAll(async () => {
  await DataBase.destroy();
  server.close()
});