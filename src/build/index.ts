import "reflect-metadata"
import express from 'express';
import { AppDataSource } from "../database/data-source";
import app from "./app"

function main(){
  const PORT = process.env.PORT || 3000
  AppDataSource.initialize()
  app.listen(PORT);
  console.log(`Escuchando en puerto http://localhost:${PORT}...`);
}

main();





