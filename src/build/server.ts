import "reflect-metadata"
import express from 'express';
import { Request, Response } from 'express';
import { engine } from 'express-handlebars';
import { AppDataSource } from "../database/data-source";
import { Films, People } from "../database/entity/Models";

const app = express()
const AXIOS = require("axios")
const PATH = require("path")
const PORT = process.env.PORT || 3000
const EventEmitter = require("events")

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', PATH.join(__dirname, '../views'));

const htmlFile = (file: string): string => {
  return PATH.join(__dirname, '../public', file);
};

function sendError(res:Response, codeError:number, errorInfo:string){
  console.error(res.statusCode);
  res.statusCode = codeError;
  res.render("errorTemplate",{
    error: `${codeError}`,
    errorInfo: errorInfo
  });
};

async function refillDB(res:Response){
  try {
    var linksAPI = await AXIOS.get('https://swapi.dev/api/');
    var filmsAPI = await AXIOS.get(linksAPI.data.films);
    for(let i = 0; i < filmsAPI.data.results.length; i++){
      let filmAPI = filmsAPI.data.results[i]
      let film = new Films()
      film.title = filmAPI.title
      film.episode_id = filmAPI.episode_id
      await AppDataSource.manager.save(film)
      //busco todos los persojaes de esa pelicula y los guardo en la base de datos. al finalizar 
      //Si ya existe el personaje entonces simplemente agrego a su lista ManyToMany de peliculas la pelicula actual
      console.log("Longitud de la cantidad de people en la película --", filmAPI.characters.length)
      for(let j = 0; j < filmAPI.characters.length; j++){
        let characterAPI = await AXIOS.get(filmAPI.characters[j]);
        console.log(characterAPI.data)
        let peopleRepository = await AppDataSource.getRepository(People)
        let characterDB = await peopleRepository.findOneBy({name: characterAPI.data.name})
        if(characterDB){
          //Si existe entonces solo agregar la pelicula a su repertorio
          characterDB.films.push(film)
          film.characters.push(characterDB)
        }else{
          let people = new People()
          people.name = characterAPI.data.name
          people.gender = characterAPI.data.gender
          people.species = await AXIOS.get(characterAPI.data.species[0]).data.name
          people.films = [film]
          await AppDataSource.manager.save(people)
          console.log("PERSONAJE GUARDADO")
          console.log(people.name)
          film.characters.push(people)
        }
      };
      await AppDataSource.manager.save(film)
      console.log("PELICULA GUARDADA")
      console.log(film.title)
    }
  } catch (error) {
    sendError(res,502,'Bad Gateway');
  }
}

async function checkDB(res:Response) {
  /*Chequea la base de datos y si no tiene películas las completa con la API externa*/
  // Condicional, existe información de peliculas en la base de datos.
  //Obtener lista de peliculas
  const filmsRepository = AppDataSource.getRepository(Films)
  const savedFilms = await filmsRepository.find()
  if(savedFilms.length === 0){
    refillDB(res);
  }
}


AppDataSource.initialize()
  .then(() => {
    app.use(async (req:Request, res:Response) => {
      console.log(`Metodo: ${req.method}`);
      console.log(`Path: ${req.path}`);
      switch (req.method) {
        case "GET":
          console.log("req.path: ", req.path);
          console.log("req.params: ", req.params)
          if (req.path.startsWith("/films")) {
            const title = req.path.split("/")[2];
            if (!title) {
              res.render("infoTemplate");
            } else {
              console.log("Parametro buscado:", req.query.searchFilm)
              let param:string = String(req.query.searchFilm);
              //{results: db.results.filter(film => (film.title).toUpperCase().includes(param.toUpperCase()))}
              res.render("infoTemplate")
            }
          } else {
            switch (req.path) {
              case "/":
                checkDB(res);
                res.sendFile(htmlFile("index.html"));
                break;
              default:
                sendError(res,404,'Not found');
                break;
            }
          }
          break;
        case "DELETE":
          break;
    
        default:
          await sendError(res,501,'Not Implemented');
          break;
      }
    });
    
    app.listen(PORT, () => {
      console.log(`Escuchando en puerto ${PORT}...`);
    });

  })




