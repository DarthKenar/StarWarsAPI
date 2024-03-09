import { AppDataSource } from "../../database/data-source";
import { Films, People, PeopleInFilms} from "../../database/entity/Models";
import { Request, Response } from 'express';

const express = require('express');
const app = express()
const routerFilm = express.Router();

import { error, saveError, refillFilmsInDB, refillPeopleForThisFilm,updateFilmCharactersStatus, getPeopleIdWhitFilmId} from "./utils/film-utils"


routerFilm.get("/s/all/", async (req:Request, res:Response) => {
  await refillFilmsInDB(res)
  let filmsRepository = await AppDataSource.getRepository(Films)
  let films = await filmsRepository.find()
  if(films.length > 0){
    res.render("infoTemplate", {results: films, searchFilm: true});
  }else{
    res.render("infoTemplate", {error: error})
  }
})


routerFilm.use(async (req:Request, res:Response) => {
  console.log(`Metodo: ${req.method}`);
  console.log(`Path: ${req.path}`);
  let pathSplited = req.path.split("/")
  pathSplited = pathSplited.filter(item => item !== "" && item !== "helpers.js");
  let param = pathSplited[pathSplited.length - 1]
  switch (req.method) {
    case "GET":
      console.log("Ultimo parámetro del path:", param)
      if (req.path.startsWith("/films")) {
        if (param == "all") {

        } else {
          console.log("Parametro buscado:", req.query.searchFilm)
          let someFilms:string = String(req.query.searchFilm);
          //https://www.tutorialspoint.com/typeorm/typeorm_query_builder.htm
          //https://typeorm.io/#using-querybuilder
          let filmsRepository = await AppDataSource.getRepository(Films)
          let films = await filmsRepository
            .createQueryBuilder("film")
            .where("LOWER(film.title) LIKE LOWER(:title)", { title: `%${someFilms}%` })
            .getMany();
          if(films.length > 0){
            res.render("infoTemplate",{results: films})
          }else{
            saveError(404, "Not Found")
            res.render("infoTemplate",{error: error})
          }
        }
      } else if (req.path.startsWith("/film")){
        try{
          let filmId:number = parseInt(param)
          await refillPeopleForThisFilm(res,filmId)
          let filmsRepository = await AppDataSource.getRepository(Films)
          let film = await filmsRepository.findOneBy({id: filmId})
          if (film === null) {
            saveError(404,"No se encontró la película, (Not found Error).")
            res.render("infoTemplate",{error: error})
          }else{
            let peopleIds = await getPeopleIdWhitFilmId(film.id)
            let peopleRepository = await AppDataSource.getRepository(People)
            let characters = await peopleRepository 
              .createQueryBuilder("film")
              .where("id IN (:...ids)", { ids: peopleIds })
              .getMany();
            if(characters.length > 0){
              res.render("infoTemplate",{film: film, characters: characters})
            }else{
              res.render("infoTemplate",{film: film, error: error})
            }
          }
        }catch{
          res.render("infoTemplate",{error: error})
        }
      } else {
        switch (req.path) {
          case "/":
            res.render("homeTemplate");
            break;
          default:
            saveError(404,'No se encuentra una respuesta para la solicitud (Not Found)');
            res.render("infoTemplate", {error: error});
            break;
        }
      }
      break;
    case "DELETE":
      if (req.path.startsWith("/delete/film/")) {
        try{
          let paramNumber = parseInt(param);
          let filmsRepository = await AppDataSource.getRepository(Films)
          let film = await filmsRepository.findOneBy({id: paramNumber})
          if(film){
            let charactersIdsToDelete = await getPeopleIdWhitFilmId(film.id);
            let peopleRepository = await AppDataSource.getRepository(People)
            //Elimina los Personajes relacionados con la película
            await peopleRepository.createQueryBuilder()
              .delete()
              .from(People)
              .where("id IN (:...charactersIdsToDelete)", { charactersIdsToDelete })
              .execute();
            let filmId = [film.id]
            let peopleInFilmsRepository = await AppDataSource.getRepository(PeopleInFilms)
            //Elimina los todos los registros de relacion entre la película y los personajes
            await peopleInFilmsRepository.createQueryBuilder()
              .delete()
              .from(PeopleInFilms)
              .where("film_id IN (:...filmId)", { filmId })
              .execute();
            await updateFilmCharactersStatus(film.id,false)
          }else{
            saveError(404,'La película buscada no se encuentra (Not Found)');
            res.render("infoTemplate", {error: error});
          }
          let films = await filmsRepository.find()
          res.render("infoTemplate", {results: films});
        }catch(err){
          // console.error(err)
          saveError(400,'La solicitud de eliminacion no se pudo ejecutar, (Bad Request)');
          res.render("infoTemplate", {error: error});
        }
      }else{
        if (req.path == "/delete/all") {
          try{
            let filmsRepository = await AppDataSource.getRepository(Films)
            await filmsRepository
            .createQueryBuilder()
            .delete()
            .execute();
            let peopleRepository = await AppDataSource.getRepository(People)
            await peopleRepository
              .createQueryBuilder()
              .delete()
              .execute();
            let peopleInFilmsRepository = await AppDataSource.getRepository(PeopleInFilms)
            await peopleInFilmsRepository
              .createQueryBuilder()
              .delete()
              .execute();
            res.render("homeTemplate");
          }catch{
            saveError(400,'Hubo un problema con la base de datos, (Bad Request)');
            res.render("infoTemplate", {error: error});
          }
        }else{
          saveError(400,'La solicitud de eliminacion no se pudo ejecutar, (Bad Request)');
          res.render("infoTemplate", {error: error});
        }
      }
      break;
    default:
      saveError(501,"Método no implementado, (Not Implemented)");
      res.render("infoTemplate", {error: error});
      break;
  }
});

module.exports = routerFilm;