import { Request, Response } from "express";
import DataBase from "../../database/data-source";
import { Films, People, PeopleInFilms} from "../../database/entity/models";
import { refillFilmsInDB, refillPeopleForThisFilm,updateFilmCharactersStatus, getPeopleIdFromDbWhitFilmId} from "../utils/film.utils"

export const getFilmById = async (req:Request, res:Response)=>{
    let filmId:number = parseInt(req.params.id)
    if(!isNaN(filmId)){
      await refillPeopleForThisFilm(res,filmId)
      let filmsRepository = await DataBase.getRepository(Films)
      let film = await filmsRepository.findOneBy({id: filmId})
      if (film === null) {
        res.status(404).json({error: `No se encontró la película ${req.params.id}.`})
      }else{
        let peopleIds = await getPeopleIdFromDbWhitFilmId(film.id)
        let peopleRepository = await DataBase.getRepository(People)
        let characters = await peopleRepository 
          .createQueryBuilder("film")
          .where("id IN (:...ids)", { ids: peopleIds })
          .getMany();
        if(characters.length > 0){
          res.json({film: film, "characters": characters})
        }else{
          res.json({film: film, error: "Bad Gateway."})
        }
      }
    }else{
      res.status(400).json({error: `La solicitud "${req.params.id}" es incorrecta.`})
    }
  }

export const getFilmsByName = async (req:Request, res:Response) => {
    console.log("Parámetro buscado:", req.query.searchFilm)
    let someFilms:string = String(req.query.searchFilm);
    //https://www.tutorialspoint.com/typeorm/typeorm_query_builder.htm
    //https://typeorm.io/#using-querybuilder
    let filmsRepository = await DataBase.getRepository(Films)
    let films = await filmsRepository
      .createQueryBuilder("film")
      .where("LOWER(film.title) LIKE LOWER(:title)", { title: `%${someFilms}%` })
      .getMany();
    if(films.length > 0){
      res.json({results: films})
    }else{
      res.status(404).json({error: `No se encontraron películas para la búsqueda "${req.query.searchFilm}"`})
    }
  }

export const getFilmsAll = async (req:Request, res:Response) => {
  try{
    await refillFilmsInDB(res)
    let filmsRepository = await DataBase.getRepository(Films)
    let films = await filmsRepository.find()
    res.json({results: films})
  }catch{
    res.status(502).json({error: "Bad Gateway"})
  }
}

export const delFilmById = async (req:Request, res:Response)=>{
    let filmId = parseInt(req.params.id);
    if(!isNaN(filmId)){
      let filmsRepository = await DataBase.getRepository(Films)
      let film = await filmsRepository.findOneBy({id: filmId})
      if(film){
        let charactersIdsToDelete = await getPeopleIdFromDbWhitFilmId(film.id);
        if(charactersIdsToDelete.length > 0){
          try{
            let peopleRepository = await DataBase.getRepository(People)
            await peopleRepository.createQueryBuilder()
              .delete()
              .from(People)
              .where("id IN (:...charactersIdsToDelete)", { charactersIdsToDelete })
              .execute();
            let filmId = [film.id]
            let peopleInFilmsRepository = await DataBase.getRepository(PeopleInFilms)
            await peopleInFilmsRepository.createQueryBuilder()
              .delete()
              .from(PeopleInFilms)
              .where("film_id IN (:...filmId)", { filmId })
              .execute();
            await updateFilmCharactersStatus(film.id,false)
            let films = await filmsRepository.find()
            res.json({results: films, message: `Los personajes de la película ${film.title} se eliminaron correctamente.`});
          }catch{
            res.status(503).json({error: "El servidor no está listo para manejar la petición."})
          }
        }else{
          res.status(404).json({error: `La película ${film.title}, no tiene personajes asociados para eliminar.`})
        }
      }else{
        res.status(404).json({error: `La película con id ${req.params.id} para eliminar, no se encuentra.`})
      }
    }else{
      res.status(400).json({error: `La solicitud "${req.params.id}" es incorrecta.`})
    }
  }

export const delFilmsAll = async(req:Request,res:Response) =>{
    try{
      var filmsRepository = await DataBase.getRepository(Films)
      var peopleInFilmsRepository = await DataBase.getRepository(PeopleInFilms)
      var peopleRepository = await DataBase.getRepository(People)
      let films = await filmsRepository.find()
      let peopleInFilms = await peopleInFilmsRepository.find()
      let people = await peopleRepository.find()
      console.log(films.length === 0 && peopleInFilms.length === 0 && people.length === 0)
      if(films.length === 0 && peopleInFilms.length === 0 && people.length === 0){
        res.status(404).json({error:"La base de datos no tiene películas para eliminar."})
      }else{
        await filmsRepository
          .createQueryBuilder()
          .delete()
          .execute();
        await peopleRepository
            .createQueryBuilder()
            .delete()
            .execute();
        await peopleInFilmsRepository
            .createQueryBuilder()
            .delete()
            .execute();
        res.json({message:"Las películas se eliminaron correctamente!"})
      }
    }catch{
      res.status(503).json({error:"El servidor no está listo para manejar la petición."})
    }
  }