import { Request, Response } from 'express';

const PATH = require("path")
const EXPRESS = require('express')
const APP = EXPRESS()
const PORT = 3000
const EventEmitter = require("events")

const requestStarWarsAPI = new EventEmitter()

async function checkDB() {
  //reemplazar true por comprobacion de base de datos
  if(true){
    await console.log("updating DB")
  }else{
     //realizar peticion a la api
    
  }
}

//Events Handlers
requestStarWarsAPI.on("refillDB",(req:Request)=>{
  console.log("Event refillDB")
  //si db no existe
    //realizar peticion a la API
})

requestStarWarsAPI.on("refillObject",()=>{
  requestStarWarsAPI.emit("refillDB")
  //buscar ese objeto específico en la db.
  //si no existe
    //realizar peticion a la api de ese objeto en específico y guardarlo en la DB
})

const htmlFile = (file: string): string => {
  console.log(__dirname)
  return PATH.join(__dirname, '../public', file)
};

APP.get('/', async (req:Request, res:Response) => {
  await requestStarWarsAPI.emit("refillDB", req)
  let context: string;
  req.on("data",(info:JSON)=>{
    console.log(typeof info)
    context = info.toString()
    res.end("context")
  })
  
})

APP.listen(PORT, () => {
  console.log(`Listening port ${PORT}`)
})


