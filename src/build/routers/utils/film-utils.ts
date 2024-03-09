import { AppDataSource } from "../../../database/data-source";
import { Films, People, PeopleInFilms} from "../../../database/entity/Models";
import { Response } from 'express';

const AXIOS = require("axios")

var chekingFilms:boolean = false; //Bandera para que no se repita el rellenado de las películas
var chekingPeopleForThisFilms:number[] = []; //Bandera para que no se repita el rellenado de los personajes en una película

export var error = {
  code: 0,
  info: ""
}

//ESTA FUNCION DEBE REFACTORIZARSE PARA DEVOLVER LOS ERRORES EN EL MISMO res
export function saveError(res:Response, errorCode:number, errorInfo:string){
  res.statusCode = errorCode
  error.code = errorCode
  error.info = errorInfo;
};

export async function refillFilmsInDB(res:Response){
  //Completa la base de datos con las películas de la API
  if(!chekingFilms){
    chekingFilms = true;
    try{
      let filmsAPI = await AXIOS.get("https://swapi.info/api/films");
      let filmRepository = await AppDataSource.getRepository(Films)
      for(let i = 0; i < filmsAPI.data.length; i++){
        let filmAPI = filmsAPI.data[i]
        let episode_id = await filmRepository.findOneBy({episode_id: filmAPI.episode_id})
        if(!episode_id){
          let film = new Films()
          let filmUrlSplited = (filmAPI.url).split("/")
          let id = filmUrlSplited[filmUrlSplited.length - 1]
          film.id = id
          film.title = filmAPI.title
          film.episode_id = filmAPI.episode_id
          await updateFilmCharactersStatus(id,false)
          await AppDataSource.manager.save(film)
          console.log(`Película ${film.title} guardada!`)
        }
      }
    }catch(err){
      saveError(res, 502,'Bad Gateway.')
      console.error(err)
    }finally{
      chekingFilms = false
    }
  }
}

export async function refillPeopleForThisFilm(res:Response, id:number) {
  let characters = await getPeopleIdWhitFilmId(id)
  if(characters.length === 0){
    if(!chekingPeopleForThisFilms.includes(id)){
      chekingPeopleForThisFilms.push(id)
      try{
        let filmAPI = await AXIOS.get(`https://swapi.info/api/films/${id}/`);
        let characters = filmAPI.data.characters
        for(let i = 0; i < characters.length; i++){
          let characterAPI = await AXIOS.get(characters[i]);
          let peopleRepository = await AppDataSource.getRepository(People)
          let characterInDB = await peopleRepository.findOneBy({name: characterAPI.data.name})
          let characterUrlSplited = characters[i].split('/')
          let characterIdFromApi:number = Number(characterUrlSplited[characterUrlSplited.length - 1])
          let peopleInFilms = new PeopleInFilms()
          peopleInFilms.film_id = id
          if(characterInDB){
            peopleInFilms.people_id = characterInDB.id
          }else{
            let people = new People()
            people.id = characterIdFromApi
            people.name = characterAPI.data.name
            people.gender = characterAPI.data.gender
            let species = await getSpecieFromThisUrl(res, characterAPI.data.species[0])
            people.species = species
            AppDataSource.manager.save(people)
            console.log(`Personaje ${people.name} guardado!`)
            peopleInFilms.people_id = people.id
          }
          await AppDataSource.manager.save(peopleInFilms)
          await updateFilmCharactersStatus(id,true)
        }
      }catch(err){
        saveError(res, 502,'Bad Gateway.');
        await updateFilmCharactersStatus(id,false)
        // console.error(err)
      }finally{
        chekingPeopleForThisFilms = chekingPeopleForThisFilms.filter(item => item !== id);
      }
    }
  }
}

export async function updateFilmCharactersStatus(id:number, status:boolean) {//updateFilmCharactersStatus
    let filmsRepository = await AppDataSource.getRepository(Films)
    let film = await filmsRepository.findOneBy({id: id});
    if(film){
      film.characters = status;
      await filmsRepository.save(film)
    }
  }
  
export async function getPeopleIdWhitFilmId(id:number){
  try{
    let peopleInFilmsRepository = await AppDataSource.getRepository(PeopleInFilms)
    let peopleInFilms = await peopleInFilmsRepository.findBy({film_id: id})
    let peopleIds = peopleInFilms.map(obj => obj.people_id);
    return peopleIds
  }catch(err){
    // console.log(err)
    return []
  }
}
  
export async function getSpecieFromThisUrl(res:Response, url:string) {
  if(url){
    try{
      let species = await AXIOS.get(url)
      return species.data.name
    }catch(err){
      // console.error(err)
      saveError(res, 502, 'Bad Gateway.');
    }
  }else{
    return "human"
  }
}