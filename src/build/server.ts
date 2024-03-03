import { Request, Response } from 'express';

const path = require("path")
const EventEmitter = require("events")
const express = require('express')
const app = express()
const port = 3000

const requestStarWarsAPI = new EventEmitter()

//Events Handlers
requestStarWarsAPI.on("refillDB",()=>{
  console.log("Event refillDB")
  //si db no existe
  //realizar peticion a la API
})

const htmlFile = (file: string): string => {
  return path.join(__dirname, '../public', file)
};

app.get('/', (req:Request, res:Response) => {
  requestStarWarsAPI.emit("refillDB")
  res.sendFile(htmlFile("index.html"))
})

app.listen(port, () => {
  console.log(`Listening port ${port}`)
})


