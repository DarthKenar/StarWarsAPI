import "reflect-metadata"
import express from 'express';
import { Request, Response } from 'express';
import { engine } from 'express-handlebars';
import { AppDataSource } from "../database/data-source";
import { Films, People } from "../database/entity/Models";

const app = express()
const AXIOS = require("axios")
const PATH = require("path")
const PORT = process.env.PORT || 3000
const EventEmitter = require("events")

function sendError(res:Response, codeError:number, errorInfo:string){
  // console.error(res.statusCode);
  res.statusCode = codeError;
  res.render("errorTemplate",{
    error: `${codeError}`,
    errorInfo: errorInfo
  });
};

async function checkDB(res:Response) {
  /*Chequea la base de datos y si no tiene películas las completa con la API externa*/
  // Condicional, existe información de peliculas en la base de datos.
  //Obtener lista de peliculas
  const filmsRepository = AppDataSource.getRepository(Films)
  const savedFilms = await filmsRepository.find()
  
  console.log("SavedFilms -->", {savedFilms})
  console.log("SavedFilms -->", savedFilms)

  if(savedFilms == null){
    console.log("updating DB");
  }else{
    try {
      console.log("SavedFilms -->", {savedFilms})
      console.log("SavedFilms -->", savedFilms)
      var dataAPI = await AXIOS.get('https://swapi.dev/api/films');
      // console.log(typeof dataAPI)
      dataAPI = dataAPI.data
      // console.log("Informacion obtenida de 'https://swapi.dev/api/' correctamente.");
      //Guardar info en la base de datos
    } catch (error) {
      sendError(res,502,'Bad Gateway');
    }
  }
}

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', PATH.join(__dirname, './views'));

const htmlFile = (file: string): string => {
  return PATH.join(__dirname, '../public', file);
};

AppDataSource.initialize()
  .then(() => {
    app.use(async (req:Request, res:Response) => {
      // console.log(`Metodo: ${req.method}`);
      // console.log(`Path: ${req.path}`);
      switch (req.method) {
        case "GET":
          // console.log(req.path);
          // console.log(req.params)
          if (req.path.startsWith("/films")) {
            const title = req.path.split("/")[2];
            if (!title) {
              console.log(req.path)
              // res.render("infoTemplate", {results: db.results, searchFilm: true});
            } else {
              // console.log("Parametro buscado:", req.query.searchFilm)
              let param:string = String(req.query.searchFilm);
              // res.render("infoTemplate",{results: db.results.filter(film => (film.title).toUpperCase().includes(param.toUpperCase()))})
            }
          } else {
            switch (req.path) {
              case "/":
                checkDB(res);
                res.sendFile(htmlFile("index.html"));
                break;
              default:
                sendError(res,404,'Not found');
                break;
            }
          }
          break;
        case "DELETE":
          break;
    
        default:
          await sendError(res,501,'Not Implemented');
          break;
      }
    });
    
    app.listen(PORT, () => {
      console.log(`Escuchando en puerto ${PORT}...`);
    });

  })




