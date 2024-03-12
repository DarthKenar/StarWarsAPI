const express = require('express');
const routerFilm = express.Router();

import {
  getFilmById,
  getFilmsByName,
  getFilmsAll,
  delFilmById,
  delFilmsAll
} from "../controllers/film.controller"

routerFilm.get("/:id", getFilmById)

routerFilm.get("/s/search", getFilmsByName)

routerFilm.get("/s/all", getFilmsAll)

routerFilm.delete("/del/:id", delFilmById)

routerFilm.delete("/s/del/all", delFilmsAll)

module.exports = routerFilm;