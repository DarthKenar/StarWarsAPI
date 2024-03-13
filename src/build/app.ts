import "reflect-metadata"
import express from 'express';
import { Request, Response } from 'express';

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../../src/docs/swagger.json');
const app = express()

//https://editor.swagger.io/
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Routers
const routerFilm = require('./routes/film.routes');
app.use('/film', routerFilm);
//...

app.get("/",(req:Request, res:Response)=>{
    res.json({message:"Bienvenido a SWAPI"})
})

//Middleware 404
app.use((req:Request, res:Response)=>{
    if(req.method !== "GET" && req.method !== "DELETE"){
        res.status(501).json({error:"El método solicitado no está soportado por el servidor y no puede ser manejado."})
    }else{
        res.status(404).json({error:"La pagina solicitada no se encuentra."})
    }
})

export default app;