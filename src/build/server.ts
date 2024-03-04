import { Request, Response } from 'express';

const PATH = require("path")
const EventEmitter = require("events")
const EXPRESS = require('express')
const APP = EXPRESS()
const PORT = 3000

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
requestStarWarsAPI.on("refillDB",()=>{
  console.log("Event refillDB")
  return checkDB()
})

const htmlFile = (file: string): string => {
  return PATH.join(__dirname, '../public', file)
};

APP.get('/', (req:Request, res:Response) => {
  requestStarWarsAPI.emit("refillDB")
  res.sendFile(htmlFile("index.html"))
})

APP.listen(PORT, () => {
  console.log(`Listening port ${PORT}`)
})


