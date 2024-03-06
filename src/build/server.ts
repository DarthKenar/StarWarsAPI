import "reflect-metadata"
import express from 'express';
import { Request, Response } from 'express';
import { engine } from 'express-handlebars';
import { AppDataSource } from "../database/data-source";
import { Films, People } from "../database/entity/Models";
import { IntegerType } from "typeorm";

const app = express()
const AXIOS = require("axios")
const PATH = require("path")
const PORT = process.env.PORT || 3000
const EventEmitter = require("events")
var chekedDB:boolean = false; //Bandera para comprobacion de DB
var chekedCompleteDB:boolean = false; //Muestra o no al cliente si se ha terminado el guardado en la DB
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
      console.log(`CREANDO PELICULA NUEVA...${filmAPI.title}`)
      film.episode_id = filmAPI.episode_id
      await AppDataSource.manager.save(film)
      for(let j = 0; j < filmAPI.characters.length; j++){
        let characterAPI = await AXIOS.get(filmAPI.characters[j]);
        let peopleRepository = await AppDataSource.getRepository(People)
        let characterDB = await peopleRepository.findOneBy({name: characterAPI.data.name})
        if(characterDB){
          //Si existe entonces solo agregar la pelicula a su repertorio
          console.log("EL PERSONAJE YA EXISTE")
          // characterDB.films.push(film)
        }else{
          console.log("CREANDO NUEVA PERSONA...")
          let people = new People()
          people.idAPI = filmAPI.characters[j].split('/')[filmAPI.characters[j].split('/').length - 2]
          people.name = characterAPI.data.name
          people.gender = characterAPI.data.gender
          try{
            console.log("Buscando especie...")
            let specie = await AXIOS.get(characterAPI.data.species[0])
            people.species = await specie.data.name
            console.log(`Especie agregada: ${specie.data.name}`)
          }catch(err){
            console.error("La especie no se encuentra!")
            people.species = "undefined"
            console.log("Especie indefinida Agregada!")
          }
          // people.films = [film]
          console.log("Guardando Personaje...")
          AppDataSource.manager.save(people)
          console.log("Personaje Guardado!")
        }
      };
      await AppDataSource.manager.save(film)
      console.log(`PELICULA ${film.title} GUARDADA!`)
    }
    chekedCompleteDB = true; //Se completo la DB
  } catch (error) {
    sendError(res,502,'Bad Gateway');
  }
}

AppDataSource.initialize()
  .then(() => {
    async function checkDB(res:Response) {
      /*Chequea la base de datos y si no tiene películas las completa con la API externa*/
      // Condicional, existe información de peliculas en la base de datos.
      //Obtener lista de peliculas
      console.log(`BANDERA DE DB (checkedDB)--> ${chekedDB}`)
      const filmsRepository = AppDataSource.getRepository(Films)
      const savedFilms = await filmsRepository.find()
      if(chekedDB === false && savedFilms.length === 0){
        console.log("La base de datos se completará")
        chekedDB = true
        console.log(`BANDERA DE DB (checkedDB)--> ${chekedDB}`)
        await refillDB(res);
      }else{
        chekedCompleteDB = true; //Se completo la DB
      }
    }

    app.use(async (req:Request, res:Response) => {
      console.log(`Metodo: ${req.method}`);
      console.log(`Path: ${req.path}`);
      switch (req.method) {
        case "GET":
          console.log("req.path: ", req.path);
          console.log("req.params: ", req.params)
          let param:string = req.path.split("/")[2];
          if (req.path.startsWith("/films")) {
            let filmsRepository = await AppDataSource.getRepository(Films)
            if (!param) {
              let param = await filmsRepository.find()
              console.log("chekedCompleteDB --> ",chekedCompleteDB)
              res.render("infoTemplate", {results: param, searchFilm: true, chekedCompleteDB: chekedCompleteDB});
            } else {
              console.log("Parametro buscado:", req.query.searchFilm)
              let someFilmParam:string = String(req.query.searchFilm);
              //https://www.tutorialspoint.com/typeorm/typeorm_query_builder.htm
              //https://typeorm.io/#using-querybuilder
              let films = await filmsRepository
                .createQueryBuilder("film")
                .where("LOWER(film.title) LIKE LOWER(:title)", { title: `%${someFilmParam}%` })
                .getMany();
              console.log("chekedCompleteDB --> ",chekedCompleteDB)
              res.render("infoTemplate",{results: films, chekedCompleteDB: chekedCompleteDB})
            }
          } else if (req.path.startsWith("/film/")){
            let oneFilmParam:number = parseInt(param)
            let filmsRepository = await AppDataSource.getRepository(Films)
            let film = await filmsRepository.findOneBy({episode_id: oneFilmParam})
            
            res.render("infoTemplate",{film: film, chekedCompleteDB: chekedCompleteDB})
          } else {
            switch (req.path) {
              case "/":
                console.log("Chequeando DB")
                checkDB(res);
                res.render("homeTemplate", {chekedCompleteDB: chekedCompleteDB});
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
      
      console.log(`Escuchando en puerto http://localhost:${PORT}...`);
    });

  })




