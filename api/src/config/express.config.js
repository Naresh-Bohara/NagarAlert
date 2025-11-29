import express from "express";
import cors from "cors"
import  HttpResponseCode from "../constants/http-status-code.contants.js";
import HttpResponse from "../constants/response-status.contants.js";
import "./db.config.js";
import router from "./router.config.js";

const application = express()

// allow cors
application.use(cors())

// parser
application.use(express.json())
application.use(express.urlencoded({extended:true}))

//healthcheck
application.use("/health", (request, response)=>{
    response.json({
        message:"working perfectly",
    })
})



// router 
application.use("/api/v1", router);

application.use((req, res, next)=>{
    next({status:HttpResponseCode.NOT_FOUND, message:"Not Found", statusCode:HttpResponse.notFound})
})

// (error, request, response, nextFunction) =>error handling middlerware / garbage collector
application.use((error, req, res, next)=>{
    console.log("GarbageError:", error)

    let statusCode = error.status || HttpResponseCode.INTERNAL_SERVER_ERROR;
    let message = error.message || "Internal Server Error"
    let status = error.statusCode || HttpResponse.internalServerError 
    let data = error.detail || null

    if(+error.code === 11000){
        statusCode = 400;
       let msg = {}
       Object.keys(error.keyPattern).map((field)=>{
        if(field === "email"){
            msg[field] = `Email is already registered, please use another email.`
        }else{
            msg[field] = `${field} must be unique`
        }
       })
       message = msg
        status = HttpResponse.validationFailed
    }

    res.status(statusCode).json({
        data:data,
        message:message,
        status:status,
        options:null,
    })
})

export default application