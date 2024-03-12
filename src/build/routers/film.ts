

const express = require('express');
const routerFilm = express.Router();

import {
  getFilm,
  getFilmsByName,
  getFilmsAll,
  delFilmById,
  delFilmsAll
} from "../controllers/film.controller"

routerFilm.get("/:id", getFilm)

routerFilm.get("/s/search", getFilmsByName)

routerFilm.get("/s/all", getFilmsAll)

routerFilm.delete("/del/:id", delFilmById)

routerFilm.delete("/s/del/all", delFilmsAll)

module.exports = routerFilm;