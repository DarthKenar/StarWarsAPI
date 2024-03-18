import "reflect-metadata"
import express from 'express';
import { Request, Response, NextFunction } from 'express';
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../../src/docs/swagger.json');
const app = express()

import { verifyToken } from './controllers/verifyToken';

//https://editor.swagger.io/
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Middlewares
app.use((req:Request, res:Response, next:NextFunction)=>{
    if(req.method !== "GET" && req.method !== "DELETE" && req.method !== "POST"){
        res.status(501).json({error:"El método solicitado no está soportado por el servidor y no puede ser manejado."})
    }else{
        next()
    }
})

app.use(express.json());

//Routers
const routerFilm = require('./routes/film.routes');
if(process.env.NODE_ENV="test"){app.use('/film', routerFilm)}else{app.use('/film',verifyToken, routerFilm)}

const routerAuth = require('./routes/auth.routes');
app.use('/auth', routerAuth);
//...

app.get("/",(req:Request, res:Response)=>{
    res.json({message:"Bienvenido a SWAPI"})
})

app.use((req:Request, res:Response)=>{
    console.log(req.method)
    console.log(req.body)
    console.log(req.path)
    res.status(404).json({error:"La pagina solicitada no se encuentra."})
})

    


export default app;