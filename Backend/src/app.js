import express from "express"
import cors from "cors"
const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: false
}))

app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended : true, limit : "16kb"}))
app.use(express.static("public"))


// routes import 
import todoRouter from "./routes/todo.routes.js"

//routes intialization

app.use("/api/v1/todo",todoRouter)
export {app}