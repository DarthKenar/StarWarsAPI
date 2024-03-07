import "reflect-metadata"
import express from 'express';
import { Request, Response } from 'express';
import { engine } from 'express-handlebars';
import { AppDataSource } from "../database/data-source";
import { Films, People, PeopleInFilms} from "../database/entity/Models";

const app = express()
const AXIOS = require("axios")
const PATH = require("path")
const PORT = process.env.PORT || 3000
var chekingFilms:boolean = false; //Bandera para que no se repita el rellenado de las películas
var chekingPeopleForThisFilms:number[] = []; //Bandera para que no se repita el rellenado de los personajes en una película
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', PATH.join(__dirname, '../views'));

AppDataSource.initialize()
  .then(() => {

    async function getPeopleIdWhitEpisodeId(episode_id:number){
      try{
        let peopleInFilmsRepository = await AppDataSource.getRepository(PeopleInFilms)
        let peopleInFilms = await peopleInFilmsRepository.findBy({film_id: episode_id})
        let peopleIds = peopleInFilms.map(obj => obj.people_id);
        return peopleIds
      }catch(err){
        console.log(err)
      }
    }

    function sendError(res:Response, codeError:number, errorInfo:string){
      console.error(res.statusCode);
      res.statusCode = codeError;
      res.render("errorTemplate",{
        error: `${codeError}`,
        errorInfo: errorInfo
      });
    };

    async function refillFilmsInDB(res:Response){
      //Completa la base de datos con las películas de la API
      if(!chekingFilms){
        chekingFilms = true;
        try{
          let filmsAPI = await AXIOS.get("https://swapi.dev/api/films");
          let filmRepository = await AppDataSource.getRepository(Films)
          for(let i = 0; i < filmsAPI.data.results.length; i++){
            let filmAPI = filmsAPI.data.results[i]
            let episode_id = await filmRepository.findOneBy({episode_id: filmAPI.episode_id})
            if(!episode_id){
              let film = new Films()
              let filmUrlSplited = (filmAPI.url).split("/")
              film.id = filmUrlSplited[filmUrlSplited.length - 2]
              film.title = filmAPI.title
              film.episode_id = filmAPI.episode_id
              await AppDataSource.manager.save(film)
              console.log(`Película ${film.title} guardada!`)
            }
          }
        }catch(err){
          console.error(err)
          // sendError(res,502,'Bad Gateway');
        }
      }
    }

    async function refillPeopleForThisFilm(res:Response, id:number) {
      if(!chekingPeopleForThisFilms){
        try{
          let filmAPI = await AXIOS.get(`https://swapi.dev/api/films/${id}/`);
          let characters = filmAPI.data.characters
          for(let i = 0; i < characters.length; i++){
            let characterAPI = await AXIOS.get(characters[i]);
            let peopleRepository = await AppDataSource.getRepository(People)
            let characterInDB = await peopleRepository.findOneBy({name: characterAPI.data.name})
            let characterUrlSplited = characters[i].split('/')
            let characterIdFromApi:number = Number(characterUrlSplited[characterUrlSplited.length - 2])
            let peopleInFilms = new PeopleInFilms()
            peopleInFilms.film_id = filmAPI.data.episode_id
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
          }
        }catch(err){
          console.error(err)
          // sendError(res,502,'Bad Gateway');
        }
      }
    }

    async function getSpecieFromThisUrl(res:Response, url:string) {
      try{
        let specie = await AXIOS.get(url)
        return specie.data.name
      }catch(err){
        console.error(err)
        sendError(res,502,'Bad Gateway');
      }
    }

    // async function checkDB(res:Response) {
    //   console.log(`BANDERA DE DB (checkedDB)--> ${chekedDB}`)
    //   const filmsRepository = AppDataSource.getRepository(Films)
    //   const savedFilms = await filmsRepository.find()
    //   let filmsAPI = await AXIOS.get("https://swapi.dev/api/films");
    //   if(chekedDB === false && savedFilms.length < filmsAPI.data.count){
    //     console.log("La base de datos se completará")
    //     chekedDB = true
    //     console.log(`BANDERA DE DB (checkedDB)--> ${chekedDB}`)
    //     await refillDB(res);
    //   }else if(savedFilms.length === filmsAPI.data.count){
    //     chekedCompleteDB = true; //Se completo la DB
    //   }
    // }

    app.use(async (req:Request, res:Response) => {
      console.log(`Metodo: ${req.method}`);
      console.log(`Path: ${req.path}`);
      let filmsRepository = await AppDataSource.getRepository(Films)
      let peopleRepository = await AppDataSource.getRepository(People)
      let peopleInFilmsRepository = await AppDataSource.getRepository(PeopleInFilms)
      switch (req.method) {
        case "GET":
          refillFilmsInDB(res)
          console.log("req.path: ", req.path);
          console.log("req.params: ", req.params)
          let pathSplited = req.path.split("/")
          let param = pathSplited[pathSplited.length - 1]
          if (req.path.startsWith("/films")) {
            console.log(param)
            if (param == "all") {
              let films = await filmsRepository.find()
              res.render("infoTemplate", {results: films, searchFilm: true});
            } else {
              console.log("Parametro buscado:", req.query.searchFilm)
              let someFilms:string = String(req.query.searchFilm);

              //https://www.tutorialspoint.com/typeorm/typeorm_query_builder.htm
              //https://typeorm.io/#using-querybuilder

              let films = await filmsRepository
                .createQueryBuilder("film")
                .where("LOWER(film.title) LIKE LOWER(:title)", { title: `%${someFilms}%` })
                .getMany();
              res.render("infoTemplate",{results: films})
            }
          } else if (req.path.startsWith("/film/")){
            let param:string = req.path.split("/")[2];
            let oneFilmParam:number = parseInt(param)
            let film = await filmsRepository.findOneBy({episode_id: oneFilmParam})
            let peopleIds = await getPeopleIdWhitEpisodeId(film!.episode_id)
            let characters = await peopleRepository 
              .createQueryBuilder("film")
              .where("idAPI IN (:...ids)", { ids: peopleIds })
              .getMany();
            res.render("infoTemplate",{film: film, characters: characters})
          
          } else {
            switch (req.path) {
              case "/":
                console.log("Chequeando DB")
                res.render("homeTemplate");
                break;
              default:
                sendError(res,404,'Not found');
                break;
            }
          }
          break;
        case "DELETE":
          if (req.path.startsWith("/delete/episode/")) {
            try{
              console.log(req.path.split("/")[2])
              let param:number = parseInt(req.path.split("/")[3]);
              let film = await filmsRepository.findOneBy({episode_id: param})
              if(film){
                let charactersIdsToDelete = await getPeopleIdWhitEpisodeId(film.episode_id);
                await peopleRepository.createQueryBuilder()
                  .delete()
                  .from(People)
                  .where("idAPI IN (:...charactersIdsToDelete)", { charactersIdsToDelete })
                  .execute();
              }else{
                throw new Error('Bad Request');
              }
            }catch(err){
              console.log(err)
              // sendError(res,400,'Bad Request');
            }

            res.render("infoTemplate");

          }else{
            switch (req.path) {
              case "/delete/all":
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
                res.render("infoTemplate");
                break;
              default:
                sendError(res,404,'Not found');
                break;
            }
            break;
          }
        default:
          sendError(res,501,'Not Implemented');
          break;
      }
    });
    
    app.listen(PORT, () => {
      
      console.log(`Escuchando en puerto http://localhost:${PORT}...`);
    });

  })




