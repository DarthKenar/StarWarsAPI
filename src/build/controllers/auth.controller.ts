import { Request, Response } from "express";
import {validators} from "../validators/auth.validator"
import { Auth } from "../../database/entity/models";
import DataBase from "../../database/data-source";


export const getLogin = async (req:Request, res:Response)=>{
    res.json({message:"Bienvenido al Login"})
}

export const getRegister = async (req:Request, res:Response)=>{
    res.json({message:"Bienvenido al formulario de registro."})
}

export const postLogin = async (req:Request, res:Response)=>{
    let email = req.body.email
    let password = req.body.password
    let validation = await validators(email, password)
    if(validation.status === true){
        let AuthRepository = DataBase.getRepository(Auth)
        let userData = await AuthRepository.findOneBy({email: email})
        if(userData){
            let passwordComparison = userData.password === password
            if(passwordComparison){
                res.redirect("/")
            }else{
                res.status(401).json({message: "La contraseña ingresada no es correcta."})
            }
        }else{
            res.status(401).json({message: "No existe un usuario con ese correo electrónico."})
        }
    }else{
        res.status(401).json({validation: validation})
    }
}

export const postRegister = async (req:Request, res:Response)=>{
    let email = req.body.email
    let password = req.body.password
    let validation = await validators(email, password)
    if(validation.status === true){
        let AuthRepository = DataBase.getRepository(Auth)
        let userData = await AuthRepository.findOneBy({email: email})
        if(!userData){
            //Registrar usuario
            let newUser = new Auth
            newUser.email = email
            newUser.password = password
            AuthRepository.save(newUser)
            res.redirect("/auth/login")
        }else{
            res.status(403).json({message: "El correo electrónico ingresado ya existe."})
        }
    }else{
        res.status(401).json({validation: validation})
    }
}