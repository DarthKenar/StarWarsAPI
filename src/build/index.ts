import "reflect-metadata"
import app from "./app"
import DataBase from "../database/data-source";

const PORT = process.env.PORT || 3000
let server = app.listen(PORT);
DataBase.initialize()
console.log(`Escuchando en puerto http://localhost:${PORT}...`);

export default server;





