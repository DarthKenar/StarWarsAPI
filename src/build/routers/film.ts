import { AppDataSource } from "../../database/data-source";
import { Films, People, PeopleInFilms} from "../../database/entity/Models";
import { Request, Response } from 'express';
import { error, saveError, refillFilmsInDB, refillPeopleForThisFilm,updateFilmCharactersStatus, getPeopleIdWhitFilmId} from "./utils/film-utils"

const express = require('express');
const routerFilm = express.Router();

routerFilm.get("/:id", async (req:Request, res:Response)=>{
  let filmId:number = parseInt(req.params.id)
  if(!isNaN(filmId)){
    await refillPeopleForThisFilm(res,filmId)
    let filmsRepository = await AppDataSource.getRepository(Films)
    let film = await filmsRepository.findOneBy({id: filmId})
    if (film === null) {
      saveError(res, 404, `No se encontró la película ${req.params.id}, (Not found Error).`)
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
  }else{
    saveError(res, 400,`La solicitud "${req.params.id}" es incorrecta.`)
    res.render("infoTemplate",{error: error})
  }

})

routerFilm.get("/s/search", async (req:Request, res:Response) => {
  console.log("Parametro buscado:", req.query.searchFilm)
  let someFilms:string = String(req.query.searchFilm);
  //https://www.tutorialspoint.com/typeorm/typeorm_query_builder.htm
  //https://typeorm.io/#using-querybuilder
  console.log(someFilms)
  let filmsRepository = await AppDataSource.getRepository(Films)
  let films = await filmsRepository
    .createQueryBuilder("film")
    .where("LOWER(film.title) LIKE LOWER(:title)", { title: `%${someFilms}%` })
    .getMany();
  if(films.length > 0){
    res.render("infoTemplate",{results: films})
  }else{
    saveError(res, 404, "Not Found")
    res.render("infoTemplate",{error: error})
  }
})

routerFilm.get("/s/all", async (req:Request, res:Response) => {
  await refillFilmsInDB(res)
  let filmsRepository = await AppDataSource.getRepository(Films)
  let films = await filmsRepository.find()
  if(films.length > 0){
    res.render("infoTemplate", {results: films, searchFilm: true});
  }else{
    res.render("infoTemplate", {error: error})
  }
})

routerFilm.delete("/del/:id", async (req:Request, res:Response)=>{
  let filmId = parseInt(req.params.id);
  if(!isNaN(filmId)){
    let filmsRepository = await AppDataSource.getRepository(Films)
    let film = await filmsRepository.findOneBy({id: filmId})
    if(film){
      let charactersIdsToDelete = await getPeopleIdWhitFilmId(film.id);
      let peopleRepository = await AppDataSource.getRepository(People)
      await peopleRepository.createQueryBuilder()
        .delete()
        .from(People)
        .where("id IN (:...charactersIdsToDelete)", { charactersIdsToDelete })
        .execute();
      let filmId = [film.id]
      let peopleInFilmsRepository = await AppDataSource.getRepository(PeopleInFilms)
      await peopleInFilmsRepository.createQueryBuilder()
        .delete()
        .from(PeopleInFilms)
        .where("film_id IN (:...filmId)", { filmId })
        .execute();
      await updateFilmCharactersStatus(film.id,false)
      let films = await filmsRepository.find()
      res.render("infoTemplate", {results: films});
    }else{
      saveError(res, 404, `La película ${req.params.id} a eliminar no se encuentra (Not Found)`);
      res.render("infoTemplate", {error: error});
    }
  }else{
    saveError(res, 400, `La solicitud "${req.params.id}" es incorrecta.`)
    res.render("infoTemplate",{error: error})
  }
})

routerFilm.delete("/s/del/all",async(req:Request,res:Response) =>{
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
})

module.exports = routerFilm;