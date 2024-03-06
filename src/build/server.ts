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
var chekedDB:boolean = false; //Bandera para comprobacion de DB
var chekedCompleteDB:boolean = false; //Muestra o no al cliente si se ha terminado el guardado en la DB
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', PATH.join(__dirname, '../views'));

AppDataSource.initialize()
  .then(() => {

    async function findAllIdsPeopleForThisFilm(episode_id:number){
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
    async function refillDB(res:Response){
      try {
        let filmsAPI = await AXIOS.get("https://swapi.dev/api/films");
        for(let i = 0; i < filmsAPI.data.results.length; i++){
          let filmAPI = filmsAPI.data.results[i]
          //obtener pelicula de la base de datos
          let filmRepository = await AppDataSource.getRepository(Films)
          let episode_id = await filmRepository.findOneBy({episode_id: filmAPI.episode_id})
          if(!episode_id){
            let film = new Films()
            film.title = filmAPI.title
            console.log(`CREANDO PELICULA NUEVA...${filmAPI.title}`)
            film.episode_id = filmAPI.episode_id
            await AppDataSource.manager.save(film)
            for(let j = 0; j < filmAPI.characters.length; j++){
              let characterAPI = await AXIOS.get(filmAPI.characters[j]);
              let peopleRepository = await AppDataSource.getRepository(People)
              let characterDB = await peopleRepository.findOneBy({name: characterAPI.data.name})
              let characterID = filmAPI.characters[j].split('/')
              let idAPI:number = Number(characterID[characterID.length - 2])
              if(characterDB){
                //Si existe entonces solo agregar la pelicula a su repertorio
                console.log("EL PERSONAJE YA EXISTE")
                // characterDB.films.push(film)
              }else{
                console.log("CREANDO NUEVA PERSONA...")
                let people = new People()
                people.idAPI = idAPI;
                people.name = characterAPI.data.name
                people.gender = characterAPI.data.gender
                try{
                  console.log("Buscando especie...")
                  let specie = await AXIOS.get(characterAPI.data.species[0])
                  people.species = await specie.data.name
                  console.log(`Especie agregada: ${specie.data.name}`)
                }catch(err){
                  console.error("La especie no se encuentra!")
                  people.species = "undefined"
                  console.log("Especie indefinida Agregada!")
                }

                //Guardamos la relacion ManyToMany
                let peopleInFilms = new PeopleInFilms()
                peopleInFilms.film_id = film.episode_id
                peopleInFilms.people_id = people.idAPI
                await AppDataSource.manager.save(peopleInFilms)
                console.log("Guardando Personaje...")
                AppDataSource.manager.save(people)
                
                console.log("Personaje Guardado!")
              }
            };
            await AppDataSource.manager.save(film)
            console.log(`PELICULA ${film.title} GUARDADA!`)
          }
        }
        console.log("BASE DE DATOS COMPLETA chekedCompleteDB")
        chekedCompleteDB = true; //Se completo la DB
      } catch (error) {
        sendError(res,502,'Bad Gateway');
      }
    }
    async function checkDB(res:Response) {
      console.log(`BANDERA DE DB (checkedDB)--> ${chekedDB}`)
      const filmsRepository = AppDataSource.getRepository(Films)
      const savedFilms = await filmsRepository.find()
      let filmsAPI = await AXIOS.get("https://swapi.dev/api/films");
      if(chekedDB === false && savedFilms.length < filmsAPI.data.count){
        console.log("La base de datos se completará")
        chekedDB = true
        console.log(`BANDERA DE DB (checkedDB)--> ${chekedDB}`)
        await refillDB(res);
      }else if(savedFilms.length === filmsAPI.data.count){
        chekedCompleteDB = true; //Se completo la DB
      }
    }

    app.use(async (req:Request, res:Response) => {
      console.log(`Metodo: ${req.method}`);
      console.log(`Path: ${req.path}`);
      checkDB(res);
      let filmsRepository = await AppDataSource.getRepository(Films)
      let peopleRepository = await AppDataSource.getRepository(People)
      let peopleInFilmsRepository = await AppDataSource.getRepository(PeopleInFilms)
      switch (req.method) {
        case "GET":

          console.log("req.path: ", req.path);
          console.log("req.params: ", req.params)
          let param:string = req.path.split("/")[2];
          
          if (req.path.startsWith("/films")) {

            if (!param) {
              let param = await filmsRepository.find()
              console.log("chekedCompleteDB --> ",chekedCompleteDB)
              res.render("infoTemplate", {results: param, searchFilm: true, chekedCompleteDB: chekedCompleteDB});
            } else {
              console.log("Parametro buscado:", req.query.searchFilm)
              let someFilmParam:string = String(req.query.searchFilm);
              //https://www.tutorialspoint.com/typeorm/typeorm_query_builder.htm
              //https://typeorm.io/#using-querybuilder
              let films = await filmsRepository
                .createQueryBuilder("film")
                .where("LOWER(film.title) LIKE LOWER(:title)", { title: `%${someFilmParam}%` })
                .getMany();
              console.log("chekedCompleteDB --> ",chekedCompleteDB)
              res.render("infoTemplate",{results: films, chekedCompleteDB: chekedCompleteDB})
            }

          } else if (req.path.startsWith("/film/")){

            let oneFilmParam:number = parseInt(param)
            let film = await filmsRepository.findOneBy({episode_id: oneFilmParam})
            let peopleIds = await findAllIdsPeopleForThisFilm(film!.episode_id)
            let characters = await peopleRepository 
              .createQueryBuilder("film")
              .where("idAPI IN (:...ids)", { ids: peopleIds })
              .getMany();
            res.render("infoTemplate",{film: film, characters: characters,chekedCompleteDB: chekedCompleteDB})
          
          } else {
            switch (req.path) {
              case "/":
                console.log("Chequeando DB")
                res.render("homeTemplate", {chekedCompleteDB: chekedCompleteDB});
                break;
              default:
                sendError(res,404,'Not found');
                break;
            }
          }
          break;
        case "DELETE":
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

              chekedCompleteDB = false;
              chekedDB = false;
              res.render("homeTemplate", {chekedCompleteDB: chekedCompleteDB});
              break;

            case "/delete/episode_id":
              try{
                let id = Number(req.query.episode_id)
                let film = await filmsRepository.findOneBy({episode_id: id})
                if(film){
                  let charactersIdsToDelete = await findAllIdsPeopleForThisFilm(film.episode_id);
                  await peopleRepository
                    .createQueryBuilder()
                    .delete()
                    .from(People)
                    .where("idAPI IN (:...ids)", { ids: charactersIdsToDelete })
                    .execute();
                  await AppDataSource.manager.save(film)
                  chekedCompleteDB = false;
                  chekedDB = false;
                  res.render("homeTemplate", {chekedCompleteDB: chekedCompleteDB});
                }else{
                  throw new Error('Bad Request');
                }
              }catch(err){
                sendError(res,400,'Bad Request');
              }

              break;
            default:
              sendError(res,404,'Not found');
              break;
          }
          break;
        default:
          await sendError(res,501,'Not Implemented');
          break;
      }
    });
    
    app.listen(PORT, () => {
      
      console.log(`Escuchando en puerto http://localhost:${PORT}...`);
    });

  })




