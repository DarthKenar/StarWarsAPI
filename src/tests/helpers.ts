import { Films, People, PeopleInFilms } from "../database/entity/models";
import DataBase from "../database/data-source";

export async function createFilm(){
    let filmsRepository = await DataBase.getRepository(Films)
    let film = new Films
    film.id = 100
    film.title = "titulo de testing"
    film.characters = true
    film.episode_id = 100
    filmsRepository.save(film)
}

export async function createPeopleInFilms(){
    let peopleInFilmsRepository = await DataBase.getRepository(PeopleInFilms)
    let peopleInFilms = new PeopleInFilms
    peopleInFilms.film_id = 100
    peopleInFilms.people_id = 100
    peopleInFilmsRepository.save(peopleInFilms)
}

export async function createPeople(){
    let peopleRepository = await DataBase.getRepository(People) 
    let people = new People
    people.id = 100
    people.name = "Federico"
    people.gender = "male"
    people.species = "human"
    peopleRepository.save(people)
}
