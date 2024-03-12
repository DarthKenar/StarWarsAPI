import "reflect-metadata"
import express from 'express';
import { AppDataSource } from "../database/data-source";
import app from "./app"

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../../src/docs/swagger.json');
const PATH = require("path")

function main(){
  const PORT = process.env.PORT || 3000
  AppDataSource.initialize()
  app.listen(PORT);
  console.log(`Escuchando en puerto http://localhost:${PORT}...`);
}

main();





