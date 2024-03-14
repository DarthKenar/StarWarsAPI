import { Request, Response } from "express";
import {validators} from "../validators/auth.validator"


export const getLogin = async (req:Request, res:Response)=>{
    res.json({message:"Bienvenido al Login"})
}

export const getRegister = async (req:Request, res:Response)=>{
    res.json({message:"Bienvenido al formulario de registro."})
}

export const postLogin = async (req:Request, res:Response)=>{

    //TODO:
    // capturar información enviada por el usuario
    let email = req.body.email
    let password = req.body.password
    let validation = await validators(email, password)
    // buscar si existe un usuario con ese correo
    // ((Si no hay usuario en la BD responder que no existe el usuario con ese correo))
    // Si hay usuario en la BD con ese correo, comparar la contraseña ingresada con el hash de la BD
    // ((Si no coincide responder con (la contraseña ingresada es incorrecta)))
    // Si la contraseña pasa entonces enviar (Sesión de usuario iniciada correctamente)

    res.json({})
}

export const postRegister = async (req:Request, res:Response)=>{

    //TODO:
    // Capturar correo y contraseña ingresada por el usuario
    // Validadores 
    // buscar ese correo en la BD
    // ((Si ya existe ese correo entonces responder que ese correo ya existe.))
    // Si el correo No existe entonces registrar al usuario

    res.json({})
}