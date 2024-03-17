import { Films, People, PeopleInFilms } from "../database/entity/models";
import DataBase from "../database/data-source";

export async function createFilm(number:number){
    let filmsRepository = await DataBase.getRepository(Films)
    let film = new Films
    film.id = number
    film.title = "Titulo de película para testing"
    film.characters = true
    film.episode_id = number
    filmsRepository.save(film)
    console.log(film)
}

export async function createPeopleInFilms(number:number){
    let peopleInFilmsRepository = await DataBase.getRepository(PeopleInFilms)
    let peopleInFilms = new PeopleInFilms
    peopleInFilms.film_id = number
    peopleInFilms.people_id = number
    peopleInFilmsRepository.save(peopleInFilms)
}

export async function createPeople(number:number){
    let peopleRepository = await DataBase.getRepository(People) 
    let people = new People
    people.id = number
    people.name = "Federico"
    people.gender = "male"
    people.species = "human"
    peopleRepository.save(people)
}
