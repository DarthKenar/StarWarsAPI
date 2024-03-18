import { Request, Response } from "express";
import {validators} from "../validators/auth.validator"
import { Auth } from "../../database/entity/models";
import DataBase from "../../database/data-source";
import {comparePass, encryptPass} from "../utils/auth.utils"

require('dotenv').config();

const jwt = require("jsonwebtoken")

export const getLogin = async (req:Request, res:Response)=>{
    res.json({message:"Bienvenido al Login"})
}

export const getRegister = async (req:Request, res:Response)=>{
    res.json({message:"Bienvenido al formulario de registro."})
}

export const postLogin = async (req:Request, res:Response)=>{
    let email:string = req.body.email
    let password:string = req.body.password
    let validation = await validators(email, password)
    if(validation.status === true){
        let AuthRepository = DataBase.getRepository(Auth)
        let userData = await AuthRepository.findOneBy({email})
        if(userData){
            if(await comparePass(password, userData.password)){
                const token = jwt.sign({id: userData.id},process.env.secret,{expiresIn: 60 * 60 * 16})
                validation.messages.push("El usuario ha ingresado correctamente.")
                res.json({auth:true, validation, token})
            }else{
                validation.status = false
                validation.messages.push("La contraseña ingresada no es correcta.")
                res.status(400).json({validation})
            }
        }else{
            validation.status = false
            validation.messages.push("No existe un usuario con ese correo electrónico.")
            res.status(400).json({validation})
        }
    }else{
        res.status(400).json({validation})
    }
}

export const postRegister = async (req:Request, res:Response)=>{
    let email:string = req.body.email
    let password:string = req.body.password
    let validation = await validators(email, password)
    if(validation.status === true){
        let AuthRepository = DataBase.getRepository(Auth)
        let userData = await AuthRepository.findOneBy({email})
        if(!userData){
            let newUser = new Auth
            newUser.email = email
            newUser.password = await encryptPass(password)
            AuthRepository.save(newUser)
            res.json({message:"El usuario se ha registrado correctamente."})
        }else{
            validation.messages.push("El correo electrónico ingresado ya existe.")
            res.status(403).json(validation)
        }
    }else{
        res.status(400).json({validation})
    }
}