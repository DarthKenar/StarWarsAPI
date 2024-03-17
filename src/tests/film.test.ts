import app from "../build/app";
import supertest from "supertest";
import DataBase from "../database/data-source";
import server from "../build/index"
import {createFilm, createPeople, createPeopleInFilms} from "./helpers";

const request = supertest(app)

beforeAll(async ()=>{
  await DataBase.initialize()
  await createFilm(100)
  await createPeopleInFilms(100)
  await createPeople(100)
})

describe("Peticiones GET para routes Film", () => {
  //2XX
  test("getFilmsAll - Comprueba si devuelve las 6 películas, más la que nosotros hemos creado para el entorno de pruebas", async ()=>{
    let response = await request.get('/film/s/all').expect(200)
    expect(response.body.results).toHaveLength(7)
  })
  //WARNING:
  //Este test, incluye una ruta que establece una conexión con una API externa de la que obtiene datos. Si esta conexión es nula, debería devolver un error distinto fallando la prueba. 
  test("getFilmById - Comprueba que se devuelva una película correctamente y esta tenga su valor characters en true, que indica que tiene personajes guardados y relacionados en la base de datos.", async () => {
    let response = await request.get('/film/1').expect(200)
    expect(response.body.film.characters).toBe(true)
  },50000)
  test("getFilmsByName - Comprueba que devuelva una lista con 5 resultados", async () => {
    let response = await request.get('/film/s/search').query({ searchFilm: 'a'}).expect(200)
    expect(response.body.results.length).toBe(5)
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

describe("Peticiones DELETE para routes Film",()=>{
  test("delFilmById - Comprueba que se eliminen los personajes relacionados con una película.", async () => {
    let response = await request.delete('/film/del/100').expect(200)
    expect(response.body).toHaveProperty("message")
  })
  test("delFilmById - Comprueba que devuelva un error al no encontrar personajes para una película", async () => {
    let response = await request.delete('/film/del/100').expect(404)
    expect(response.body).toHaveProperty("error")
    expect(response.body.error).toContain("La película Titulo de película para testing, no tiene personajes asociados para eliminar.")
  })
  test("delFilmById - Comprueba que devuelva un error al no encontrar una película para eliminar buscando por string", async () => {
    let response = await request.delete('/film/del/qwerty').expect(400)
    expect(response.body).toHaveProperty("error")
    expect(response.body.error).toContain("La solicitud \"qwerty\" es incorrecta.")
  })
  test("delFilmById - Comprueba que devuelva un error al no encontrar una película", async () => {
    let response = await request.delete('/film/del/22').expect(404)
    expect(response.body).toHaveProperty("error")
    expect(response.body.error).toContain("La película con id 22 para eliminar, no se encuentra.")
  })
  test("delFilmsAll - Comprueba que se eliminen correctamente todas las películas, sus personajes y su asociación.", async () => {
    let response = await request.delete('/film/s/del/all').expect(200)
    expect(response.body).toHaveProperty("message")
    expect(response.body.message).toContain("Las películas se eliminaron correctamente!")
  })
  test("delFilmsAll - Comprueba que al ejecutarse solicitar por segunda vez la ruta de eliminación de películas, devuelva un error al encontrarse la base de datos vacía de estas.", async () => {
    await request.delete('/film/s/del/all')
    let response = await request.delete('/film/s/del/all').expect(404)
    expect(response.body).toHaveProperty("error")
    expect(response.body.error).toContain("La base de datos no tiene películas para eliminar.")
  })
})

afterAll(async () => {
  await DataBase.destroy();
});