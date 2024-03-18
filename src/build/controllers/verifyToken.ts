require('dotenv').config();
const jwt = require("jsonwebtoken")
import { NextFunction, Request, Response } from "express";

interface RequestId extends Request {
    userId?: string;
  }

export function verifyToken(req:RequestId, res:Response, next:NextFunction){
    const token = req.headers['x-access-token']
    if(!token){
        return res.status(401).json({
            auth: false,
            message: "El token de autenticación no existe."
        })
    }else{
        const decoded = jwt.verify(token, process.env.secret)
        req.userId = decoded.id
        next()
    }
}