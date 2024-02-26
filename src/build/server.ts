import { Request, Response } from 'express';

const path = require("path")
const express = require('express')
const app = express()
const port = 3000

const htmlFile = (file: string): string => {
  return path.join(__dirname, '../public', file);
};

app.get('/', (req:Request, res:Response) => {
  res.sendFile(htmlFile("index.html"))
})

app.listen(port, () => {
  console.log(`Listening port ${port}`)
})


