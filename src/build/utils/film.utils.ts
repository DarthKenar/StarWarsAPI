import DataBase from "../../database/data-source";
import { Films, People, PeopleInFilms} from "../../database/entity/models";
import { Response } from 'express';

const AXIOS = require("axios")

var checkingFilms:boolean = false; //Bandera para que no se repita el rellenado de las películas
var checkingPeopleForThisFilms:number[] = []; //Bandera para que no se repita el rellenado de los personajes en una película

export async function refillFilmsInDB(res:Response){
  //Busca las películas en la API externa y las guarda en la DB
  if(!checkingFilms){
    checkingFilms = true;
    let filmsAPI = await AXIOS.get("https://swapi.info/api/films");
    let filmRepository = await DataBase.getRepository(Films)
    for(let i = 0; i < filmsAPI.data.length; i++){
      let filmAPI = filmsAPI.data[i]
      let episode_id = await filmRepository.findOneBy({episode_id: filmAPI.episode_id})
      if(!episode_id){
        let film = new Films()
        let filmUrlSplitted = (filmAPI.url).split("/")
        let id = filmUrlSplitted[filmUrlSplitted.length - 1]
        film.id = id
        film.title = filmAPI.title
        film.episode_id = filmAPI.episode_id
        await updateFilmCharactersStatus(id,false)
        await filmRepository.save(film)
        console.log(`Película ${film.title} guardada!`)
      }
    }
    checkingFilms = false
  }
}

export async function refillPeopleForThisFilm(res:Response, id:number) {
  //Busca los personajes asociados con la película en la API externa y los guarda en la DB
  let characters = await getPeopleIdFromDbWhitFilmId(id)
  if(characters.length === 0){
    if(!checkingPeopleForThisFilms.includes(id)){
      checkingPeopleForThisFilms.push(id)
      try{
        let filmAPI = await AXIOS.get(`https://swapi.info/api/films/${id}/`);
        let characters = filmAPI.data.characters
        for(let i = 0; i < characters.length; i++){
          let characterAPI = await AXIOS.get(characters[i]);
          let peopleRepository = await DataBase.getRepository(People)
          let characterInDB = await peopleRepository.findOneBy({name: characterAPI.data.name})
          let characterUrlSplitted = characters[i].split('/')
          let characterIdFromApi:number = Number(characterUrlSplitted[characterUrlSplitted.length - 1])
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
            peopleRepository.save(people)
            console.log(`Personaje ${people.name} guardado!`)
            peopleInFilms.people_id = people.id
          }
          await DataBase.manager.save(peopleInFilms)
          await updateFilmCharactersStatus(id,true)
        }
      }catch(err){
        console.error(err)
        await updateFilmCharactersStatus(id,false)
      }finally{
        checkingPeopleForThisFilms = checkingPeopleForThisFilms.filter(item => item !== id);
      }
    }
  }
}

export async function updateFilmCharactersStatus(id:number, status:boolean) {
  //Actualiza el estado de film.characters (que determina si tiene o no los personajes asociados guardados en la DB.)
    let filmsRepository = await DataBase.getRepository(Films)
    let film = await filmsRepository.findOneBy({id: id});
    if(film){
      film.characters = status;
      await filmsRepository.save(film)
    }
  }
  
export async function getPeopleIdFromDbWhitFilmId(id:number):Promise<number[]>{
  //Devuelve una lista de los ID de los personajes asociados al ID de una película.
  try{
    let peopleInFilmsRepository = await DataBase.getRepository(PeopleInFilms)
    let peopleInFilms = await peopleInFilmsRepository.findBy({film_id: id})
    let peopleIds = peopleInFilms.map(obj => obj.people_id);
    return peopleIds
  }catch(err){
    console.error(err)
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