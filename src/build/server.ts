import { Request, Response } from 'express';
let ejs = require('ejs');
let people = ['geddy', 'neil', 'alex'];
let html = ejs.render('<%= people.join(", "); %>', {people: people});
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
      var dataAPI = await AXIOS.get('https://swapi.dev/api/');
      return dataAPI;
      //Guardar info en la base de datos
    } catch (error) {
      console.error(error);
      res.status(500).end("Error al realizar la solicitud a la API externa");

    }
  }
}

const htmlFile = (file: string): string => {
  return PATH.join(__dirname, '../public', file)
};

APP.use(async (req:Request, res:Response) => {
  switch (req.method) {
    case "GET":
      console.log(req.path)
      switch (req.path) {
        case "/":
          checkDB(res);
          res.sendFile(htmlFile("index.html"));
          break;
        case "/entrar":
          var dataAPI = checkDB(res);
          res.render(htmlFile("data.html"),{data: html})
          break;
        default:
          break;
      }
      break;
    case "DELETE":
    
      break;

    default:
      console.error(501)
      res.status(501).end(htmlFile("index.html"))
      
  }
})

APP.listen(PORT, () => {
  console.log(`Listening port ${PORT}`)
})


