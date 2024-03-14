import { Request, Response } from "express";

export const getLogin = async (req:Request, res:Response)=>{
    res.json({message:"Bienvenido al Login"})
}

export const getRegister = async (req:Request, res:Response)=>{
    res.json({message:"Bienvenido al formulario de registro."})
}

export const postLogin = async (req:Request, res:Response)=>{

    //TODO:
    // capturar información enviada por el usuario
    // Hacer uso de validadores en esta etapa (que devuelvan booleanos para responder con errores en este mismo controller)
    // buscar si existe un usuario con ese correo
    // ((Si no hay usuario en la BD responder que no existe el usuario con ese correo))
    // Si hay usuario en la BD con ese correo, comparar la contraseña ingresada con el hash de la BD
    // ((Si no coincide responder con (la contraseña ingresada es incorrecta)))
    // Si la contraseña pasa entonces enviar (Sesión de usuario iniciada correctamente)

    res.json({message:"Bienvenido al formulario de registro."})
}

export const postRegister = async (req:Request, res:Response)=>{

    //TODO:
    // Capturar correo y contraseña ingresada por el usuario
    // Validadores para correo correcto (que devuelva un objeto con un booleano lista de mensajes para responder con errores en este mismo controller) (usar los mismos validadores que en login para comprobar si un correo es correcto por ejemplo)
    // buscar ese correo en la BD
    // ((Si ya existe ese correo entonces responder que ese correo ya existe.))
    // Si el correo No existe entonces

    res.json({message:"Bienvenido al formulario de registro."})
}