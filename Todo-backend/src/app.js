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
  const userId = socket.handshake.auth.userId;

  if (userId) {
    socket.join(userId);
    console.log(` User ${userId} connected and joined their private room.`);
    socket.on("join_workspace", (workspaceId) => {
      socket.join(workspaceId);
      console.log(`User ${userId} joined workspace room: ${workspaceId}`);
    });
  } else {
    console.log(" A user connected, but no ID was provided.");
  }
  
  socket.on("disconnect", () => {
    console.log(` User ${userId || socket.id} disconnected.`);
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