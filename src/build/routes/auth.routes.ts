const express = require('express');
const routerAuth = express.Router();

import {
    getLogin,
    getRegister,
    postLogin,
    postRegister
  } from "../controllers/auth.controller"

routerAuth.get("/login", getLogin)

routerAuth.get("/register", getRegister)

routerAuth.post("/login/send", postLogin)

routerAuth.post("/register/send", postRegister)


module.exports = routerAuth;