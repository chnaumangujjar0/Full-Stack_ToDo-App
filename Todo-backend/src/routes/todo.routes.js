import { Router } from "express";
import { 
    addTask, 
    countData, 
    deleteTask, 
    getAllTasks, 
    gettaskById, 
    toggleStatus,  
    updateTask, 
    workspaceTasks} from "../controllers/todo.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router()
router.use(verifyJwt)
router.route("/addtask").post(addTask)
router.route("/").get(getAllTasks)
router.route("/workspace-tasks/:workspaceId").get(workspaceTasks)
router.route("/count").get(countData)
router.route("/:taskId").patch(updateTask)
router.route("/:taskId").delete(deleteTask)
router.route("/:taskId").get(gettaskById)
router.route("/toggle-status/:taskId").patch(toggleStatus)

export default router