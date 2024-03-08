import "reflect-metadata"
import express from 'express';
import { Request, Response } from 'express';
import { engine } from 'express-handlebars';
import { AppDataSource } from "../database/data-source";
import { Films, People, PeopleInFilms} from "../database/entity/Models";

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../docs/swagger.json');

const app = express()
const AXIOS = require("axios")
const PATH = require("path")
const PORT = process.env.PORT || 3000
var chekingFilms:boolean = false; //Bandera para que no se repita el rellenado de las películas
var chekingPeopleForThisFilms:number[] = []; //Bandera para que no se repita el rellenado de los personajes en una película
var error = {
  code: 0,
  info: ""
}
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', PATH.join(__dirname, '../views'));

AppDataSource.initialize()
  .then(() => {
    
    async function updateCharactersStatus(id:number, status:boolean) {
      let filmsRepository = await AppDataSource.getRepository(Films)
      let film = await filmsRepository.findOneBy({id: id});
      if(film){
        film.characters = status;
        await filmsRepository.save(film)
      }
    }

    async function getPeopleIdWhitFilmId(id:number){
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

    function saveError(codeError:number, errorInfo:string){
      error.code = codeError
      error.info = errorInfo;
    };

    async function refillFilmsInDB(res:Response){
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
              await updateCharactersStatus(id,false)
              await AppDataSource.manager.save(film)
              console.log(`Película ${film.title} guardada!`)
            }
          }
        }catch(err){
          saveError(502,"La API externa no funciona. (Bad Gateway)")
          console.error(err)
        }finally{
          chekingFilms = false
        }
      }
    }

    async function refillPeopleForThisFilm(res:Response, id:number) {
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
              await updateCharactersStatus(id,true)
            }
          }catch(err){
            saveError(502,'La API externa no funciona (Bad Gateway)');
            await updateCharactersStatus(id,false)
            // console.error(err)
          }finally{
            chekingPeopleForThisFilms = chekingPeopleForThisFilms.filter(item => item !== id);
          }
        }
      }
    }

    async function getSpecieFromThisUrl(res:Response, url:string) {
      if(url){
        try{
          let species = await AXIOS.get(url)
          return species.data.name
        }catch(err){
          // console.error(err)
          saveError(502,'La API externa no funciona, (Bad Gateway).');
        }
      }else{
        return "human"
      }
    }

    //https://editor.swagger.io/
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    app.use(async (req:Request, res:Response) => {
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
              await refillFilmsInDB(res)
              let filmsRepository = await AppDataSource.getRepository(Films)
              let films = await filmsRepository.find()
              if(films.length > 0){
                res.render("infoTemplate", {results: films, searchFilm: true});
              }else{
                res.render("infoTemplate", {error: error})
              }
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
                await updateCharactersStatus(film.id,false)
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

    app.listen(PORT, () => {
      
      console.log(`Escuchando en puerto http://localhost:${PORT}...`);
    });

  })




