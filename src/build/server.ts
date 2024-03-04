import { Request, Response } from 'express';
import { engine } from 'express-handlebars';
import express from 'express';

const AXIOS = require("axios")
const PATH = require("path")
const PORT = 3000
const EventEmitter = require("events")
const app = express()

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', PATH.join(__dirname, './views'));

const requestStarWarsAPI = new EventEmitter();

async function checkDB(res:Response) {
  // Condicional, existe información de peliculas en la base de datos.
  if(false){
    console.log("updating DB");
  }else{
    try {
      var dataAPI = await AXIOS.get('https://swapi.dev/api/');
      console.log("Informacion obtenida de 'https://swapi.dev/api/' correctamente.");
      //Guardar info en la base de datos
    } catch (error) {
      console.error(error);
      res.statusCode = 501;
      console.error(res.statusCode);
      res.render("error",{
        error: `${res.statusCode}`,
        errorInfo: 'Bad Gateway'
      });
    }
  }
}

const htmlFile = (file: string): string => {
  return PATH.join(__dirname, '../public', file);
};

app.use(async (req:Request, res:Response) => {
  console.log(`Metodo: ${req.method}`);
  console.log(`Path: ${req.path}`);
  switch (req.method) {
    case "GET":
      console.log(req.path);
      switch (req.path) {
        case "/":
          checkDB(res);
          res.render("home",{});
          break;
        case "/entrar":
          let dataAPI = await AXIOS.get('https://swapi.dev/api/');
          console.log(dataAPI);
          res.render("info",dataAPI);
          break;
        default:
          break;
      }
      break;
    case "DELETE":
      break;

    default:
      res.statusCode = 501;
      console.error(res.statusCode);
      res.status(501).end(htmlFile("index.html"));
      
  }
});

app.listen(PORT, () => {
  console.log(`Listening port ${PORT}`);
});



