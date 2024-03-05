import "reflect-metadata"
import { DataSource } from "typeorm"
import { People, Films } from "./entity/Models"

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    synchronize: true,
    logging: false,
    entities: [Films,People],
    migrations: [],
    subscribers: [],
})

// to initialize the initial connection with the database, register all entities
// and "synchronize" database schema, call "initialize()" method of a newly created database
// once in your application bootstrap