import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import http from "http"
import {Server} from "socket.io"

const app = express()
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN, 
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.set("io",io)
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended : true, limit : "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
io.on("connection", (socket) => {
  console.log("⚡ Backend Alert: A user connected with Socket ID:", socket.id);
  
  socket.on("disconnect", () => {
    console.log("🔴 Backend Alert: User disconnected:", socket.id);
  });
});
// routes import 
import todoRouter from "./routes/todo.routes.js"
import userRouter from "./routes/user.routes.js"
import notificationRouter from "./routes/notification.routes.js"
import loginActivityRouter from "./routes/loginActivity.routes.js"
import workspaceRouter from "./routes/workspace.routes.js"
import inviteRouter from "./routes/invite.routes.js"
//routes intialization
app.use("/api/v1/todo",todoRouter)
app.use("/api/v1/user",userRouter)
app.use("/api/v1/notification",notificationRouter)
app.use("/api/v1/activity",loginActivityRouter)
app.use("/api/v1/workspace",workspaceRouter)
app.use("/api/v1/invite",inviteRouter)
export {httpServer,app}