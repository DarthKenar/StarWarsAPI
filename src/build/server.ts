import { Request, Response } from 'express';

const AXIOS = require("axios")
const PATH = require("path")
const EXPRESS = require('express')
const APP = EXPRESS()
const PORT = 3000
const EventEmitter = require("events")

const requestStarWarsAPI = new EventEmitter()

async function checkDB(res:Response) {
  //reemplazar true por comprobacion de base de datos
  if(false){
    console.log("updating DB")
  }else{
    try {
      const response = await AXIOS.get('https://swapi.dev/api/');
      //Guardar info en la base de datos
    } catch (error) {
      console.error(error);
      res.status(500).end("Error al realizar la solicitud a la API externa");

    }
  }
}

const htmlFile = (file: string): string => {
  console.log(__dirname)
  return PATH.join(__dirname, '../public', file)
};

APP.use(async (req:Request, res:Response) => {
  switch (req.method) {
    case "GET":
      res.end(htmlFile("index.html"))
      break;
    case "DELETE":
    
      break;

    default:
      console.error(501)
      res.status(501).end(htmlFile("index.html"))
      
  }
  await checkDB(res)
  
})

APP.listen(PORT, () => {
  console.log(`Listening port ${PORT}`)
})


