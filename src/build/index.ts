import "reflect-metadata"
import { AppDataSource } from "../database/data-source";
import app from "./app"


const PORT = process.env.PORT || 3000
AppDataSource.initialize()
let server = app.listen(PORT);
console.log(`Escuchando en puerto http://localhost:${PORT}...`);

export default server;





