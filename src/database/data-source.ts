import "reflect-metadata"
import { DataSource } from "typeorm"
import { People, Films, PeopleInFilms} from "./entity/models"

const PATH = require("path")

function getDataSource(): DataSource {
    switch (process.env.NODE_ENV) {
        case "production":
            console.log("Base de datos establecida para el entorno de produccion")
            return new DataSource({
                type: "sqlite",
                database: PATH.join(__dirname, "./dist/database/productiondatabase.sqlite"),
                synchronize: false,
                logging: false,
                entities: [Films,People,PeopleInFilms],
                migrations: [],
                subscribers: [], 
            });
        case "dev":
            console.log("Base de datos establecida para el entorno de desarrollo")
            return new DataSource({
                type: "sqlite",
                database: PATH.join(__dirname, "./dist/database/devdatabase.sqlite"),
                synchronize: true,
                logging: false,
                entities: [Films,People,PeopleInFilms],
                migrations: [],
                subscribers: [], 
            });
        case "test":
            console.log("Base de datos establecida para el entorno de testing")
            return new DataSource({
                type: "sqlite",
                database: PATH.join(__dirname, "../database/testdatabase.sqlite"),
                synchronize: true,
                logging: false,
                entities: [Films,People,PeopleInFilms],
                migrations: [],
                subscribers: [], 
            });
        default:
            throw new Error("La base de datos no se exportará, no hay un entorno de desarrollo establecido.");
    }
}

const DataBase = getDataSource();
DataBase.initialize()
export default DataBase;
