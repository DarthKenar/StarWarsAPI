import "reflect-metadata"
import app from "./app"

const PORT = process.env.PORT || 3000
let server = app.listen(PORT);

console.log(`Escuchando en puerto http://localhost:${PORT}...`)
export default server;





