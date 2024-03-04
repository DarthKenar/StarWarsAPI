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

async function checkDB(res:Response) {
  /*Chequea la base de datos y si no tiene películas las completa con la API externa*/
  // Condicional, existe información de peliculas en la base de datos.
  if(false){
    console.log("updating DB");
  }else{
    try {
      var dataAPI = await AXIOS.get('https://swapi.dev/api/films');
      dataAPI = dataAPI.data
      console.log("Informacion obtenida de 'https://swapi.dev/api/' correctamente.");
      //Guardar info en la base de datos
    } catch (error) {
      console.error(error);
      res.statusCode = 502;
      console.error(res.statusCode);
      res.render("error",{
        error: `${res.statusCode}`,
        errorInfo: 'Bad Gateway'
      });
    }
  }
}

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
          //cargar peliculas (todas)
          var dataAPI = await AXIOS.get('https://swapi.dev/api/films');
          dataAPI = dataAPI.data
          console.log(dataAPI)
          res.render("info",dataAPI);
          break;
        default:
          res.statusCode = 404;
          console.error(res.statusCode);
          res.render("error",{
            error: `${res.statusCode}`,
            errorInfo: 'Not found'
          });
          break;
      }
      break;
    case "DELETE":
      break;

    default:
      res.statusCode = 501;
      console.error(res.statusCode);
      res.render("error",{
        error: `${res.statusCode}`,
        errorInfo: 'Bad Gateway'
      });
      break;
      
  }
});

app.listen(PORT, () => {
  console.log(`Listening port ${PORT}`);
});



