import "reflect-metadata"
import express from 'express';

import { engine } from 'express-handlebars';
import { AppDataSource } from "../database/data-source";

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../docs/swagger.json');

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
    app.use('', routerFilm);
    //...

    const PORT = process.env.PORT || 3000

    app.listen(PORT, () => {
      console.log(`Escuchando en puerto http://localhost:${PORT}...`);
    });

  })




