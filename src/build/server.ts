import express from 'express';
import { Request, Response } from 'express';
import { engine } from 'express-handlebars';

const app = express()
const AXIOS = require("axios")
const PATH = require("path")
const PORT = process.env.PORT || 3000
const EventEmitter = require("events")

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', PATH.join(__dirname, './views'));

function sendError(res:Response, codeError:number, errorInfo:string){
  console.error(res.statusCode);
  res.statusCode = codeError;
  res.render("errorTemplate",{
    error: `${codeError}`,
    errorInfo: errorInfo
  });
};

async function checkDB(res:Response) {
  /*Chequea la base de datos y si no tiene películas las completa con la API externa*/
  // Condicional, existe información de peliculas en la base de datos.
  if(false){
    console.log("updating DB");
  }else{
    try {
      var dataAPI = await AXIOS.get('https://swapi.dev/api/films');
      console.log(typeof dataAPI)
      dataAPI = dataAPI.data
      console.log("Informacion obtenida de 'https://swapi.dev/api/' correctamente.");
      //Guardar info en la base de datos
    } catch (error) {
      sendError(res,502,'Bad Gateway');
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
      console.log(req.params)
      switch (req.path) {
        case "/":
          checkDB(res);
          res.sendFile(htmlFile("index.html"));
          break;
        case "/films":
          //cargar peliculas (todas)
          var dataAPI = await AXIOS.get('https://swapi.dev/api/films');
          console.log(typeof dataAPI)
          dataAPI = dataAPI.data
          console.log("dataAPI", dataAPI)
          res.render("infoTemplate",dataAPI);
          break;
        case "/films/:title":
          const title = req.params.lenguaje;
        default:
          sendError(res,404,'Not found');
          break;
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



