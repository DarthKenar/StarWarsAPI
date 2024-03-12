import { AppDataSource } from "../../../database/data-source";
import { Films, People, PeopleInFilms} from "../../../database/entity/models";
import { Response } from 'express';

const AXIOS = require("axios")

var chekingFilms:boolean = false; //Bandera para que no se repita el rellenado de las películas
var chekingPeopleForThisFilms:number[] = []; //Bandera para que no se repita el rellenado de los personajes en una película

export var error = {
  code: 0,
  info: ""
}

export function saveError(errorCode:number, errorInfo:string){
  //Dado que htmx no renderiza cuando hay codigos de estados distintos a 200, pasamos los errores por contexto.
  //
  error.code = errorCode
  error.info = errorInfo;
};

export async function refillFilmsInDB(res:Response){
  //Busca las películas en la API externa y las guarda en la DB
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
      saveError(502,'Bad Gateway.')
      console.error(err)
    }finally{
      chekingFilms = false
    }
  }
}

export async function refillPeopleForThisFilm(res:Response, id:number) {
  //Busca los personajes asociados con la película en la API externa y los guarda en la DB
  let characters = await getPeopleIdFromDbWhitFilmId(id)
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
        saveError(502,'Bad Gateway.');
        await updateFilmCharactersStatus(id,false)
      }finally{
        chekingPeopleForThisFilms = chekingPeopleForThisFilms.filter(item => item !== id);
      }
    }
  }
}

export async function updateFilmCharactersStatus(id:number, status:boolean) {
  //Actualiza el estado de film.characters (que determina si tiene o no los personajes asociados guardados en la DB.)
    let filmsRepository = await AppDataSource.getRepository(Films)
    let film = await filmsRepository.findOneBy({id: id});
    if(film){
      film.characters = status;
      await filmsRepository.save(film)
    }
  }
  
export async function getPeopleIdFromDbWhitFilmId(id:number):Promise<number[]>{
  //Devuelve una lista de los ID de los personajes asociados al ID de una película.
  try{
    let peopleInFilmsRepository = await AppDataSource.getRepository(PeopleInFilms)
    let peopleInFilms = await peopleInFilmsRepository.findBy({film_id: id})
    let peopleIds = peopleInFilms.map(obj => obj.people_id);
    return peopleIds
  }catch(err){
    saveError(400, 'Ha ocurrido un error al intentar obtener los ID de los personajes');
    return []
  }
}
  
export async function getSpecieFromThisUrl(res:Response, url:string):Promise<string>{
  //Devuelve el nombre de la especie obtenida en la API externa
  if(url){
    let species = await AXIOS.get(url)
    if(typeof species.data.name === "string"){
      return species.data.name
    }else{
      return "undefined"
    }
  }else{
    //en la API externa los humanos no tienen URL
    return "human"
  }
}