import "reflect-metadata"
import express from 'express';
import { engine } from 'express-handlebars';
import { AppDataSource } from "../database/data-source";
import { Request, Response } from 'express';
import { saveError, error } from "./routers/utils/film-utils";

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../../src/docs/swagger.json');
const app = express()
const PATH = require("path")

//Handlebars config
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', PATH.join(__dirname, '../views'));
//

AppDataSource.initialize()
  .then(() => {

    //https://editor.swagger.io/
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    //Routers
    const routerFilm = require('./routers/film.js');
    app.use('/film', routerFilm);
    //...

    app.get("/",(req:Request, res:Response)=>{
      res.render("homeTemplate");
    })

    //Middleware 404
    app.use((req:Request, res:Response)=>{
      if(req.method !== "GET" && req.method !== "DELETE"){
        saveError(501, "El método solicitado no está soportado por el servidor y no puede ser manejado.")
        res.render("infoTemplate",{error: error});
      }else{
        saveError(404, "La pagina solicitada no se encuentra.")
        res.render("infoTemplate",{error: error});
      }

    })
    const PORT = process.env.PORT || 3000

    app.listen(PORT, () => {
      console.log(`Escuchando en puerto http://localhost:${PORT}...`);
    });

  })




