import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import {
  fetchWorkspaceTasks,
  getWorkspaceById,
  updateStatus,
  deleteTaskById,
  getSingleTaskData,
  updateTaskDetails,
} from "@/Api/api";
import InviteMemberModal from "../common/InviteMemberModal";
import TaskForm from "../common/TaskForm";
import TaskList from "../common/TaskList.jsx";
import EditTaskToast from "../common/EditTaskToast.jsx";
import Loader from "../common/Loader.jsx";
import { socket } from "@/socket";
import { Socket } from "socket.io-client";
const WorkspaceDetails = () => {
  const { workspaceId } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [members,setMembers] = useState([])
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const [taskStatus, setTaskStatus] = useState("pending");
  const [deadline, setDeadline] = useState(new Date());
  const [isTaskSubmitting, setIsTaskSubmitting] = useState(false);

  const fetchWorkspaceDetails = async () => {
    setIsLoading(true);
    try {
      const res = await getWorkspaceById(workspaceId);
      const ws = res?.[0];

      if (!ws) {
        toast.error("Workspace not found or you don't have access.");
        setWorkspace(null);
        setTasks([]);
        return;
      }

      setWorkspace(ws);
      setMembers(ws.memberDetails)

      const taskData = await fetchWorkspaceTasks(workspaceId);
      setTasks(Array.isArray(taskData) ? taskData : []);
    } catch (err) {
      toast.error("Couldn't load workspace, try again.");
      setWorkspace(null);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchWorkspaceDetails();

    const joinWorkspaceRoom = () => {
      if (workspaceId) {
        console.log("Entering workspace socket room:", workspaceId);
        socket.emit("join_workspace", workspaceId);
      }
    };

    if (socket.connected) {
      joinWorkspaceRoom();
    }
    socket.on("connect", joinWorkspaceRoom);

    const handleStatusUpdate = (updatedTask) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === updatedTask._id ? updatedTask : task
        )
      );
    };

    const handleNewMember = (user) => {
      const newMember = {
        _id: user._id,
        avatar: user.avatar,
        username: user.username,
      };

      setMembers((prev) => {
        const isDuplicate = prev.some((member) => member._id === newMember._id);
        if (isDuplicate) return prev;
        
        return [newMember, ...prev];
      });
    };

    const handleNewTask = (todo) => {
      console.log("Real-time task received:", todo);
      console.log("i am here")
      setTasks((prev) => {
        const isDuplicate = prev.some((task) => task._id === todo._id);
        if (isDuplicate) return prev;

        return [todo, ...prev];
      });
    };

    socket.on("task_status_updated", handleStatusUpdate);
    socket.on("invite_response", handleNewMember);
    socket.on("new_task", handleNewTask);

    return () => {
      socket.off("task_status_updated", handleStatusUpdate);
      socket.off("invite_response", handleNewMember); // ✅ Fixed lowercase 's'
      socket.off("new_task", handleNewTask);
      
      if (workspaceId) {
        socket.emit("leave_workspace", workspaceId);
      }
    };
  }, [workspaceId]);

  // ---- Status update ---------------------------------------------------

  const handleStatusChange = async (taskId, status) => {
    setUpdatingId(taskId);
    try {
      await updateStatus(taskId, status);
      await fetchWorkspaceDetails();
    } catch (err) {
      toast.error("Couldn't update task status, try again.");
    } finally {
      setUpdatingId("");
    }
  };

  // ---- Delete ---------------------------------------------------------

  const deleteTask = async (taskId) => {
    try {
      await deleteTaskById(taskId);
      await fetchWorkspaceDetails();
    } catch (err) {
      toast.error("Couldn't delete task, try again.");
    }
  };

  const handleDelete = (taskId) => {
    setIsToastOpen(true);
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-3 sm:gap-4 m-3 sm:m-4 w-56 sm:w-72 bg-[#FFFDF8] rounded-sm p-4 sm:p-5">
          <p className="text-[11px] tracking-[0.2em] uppercase text-stone-400 font-mono">
            Confirm delete
          </p>
          <p className="font-serif text-lg sm:text-xl text-stone-900 leading-snug">
            Delete this task?
          </p>
          <div className="flex gap-2 justify-end mt-1">
            <button
              onClick={() => {
                closeToast();
                setIsToastOpen(false);
              }}
              className="px-4 py-1.5 rounded-sm border border-stone-300 text-stone-600 text-sm hover:border-stone-500 transition-colors"
            >
              No
            </button>
            <button
              onClick={() => {
                closeToast();
                setIsToastOpen(false);
                deleteTask(taskId);
              }}
              className="px-4 py-1.5 rounded-sm bg-red-700 text-white text-sm hover:bg-red-800 transition-colors"
            >
              Yes
            </button>
          </div>
        </div>
      ),
      { autoClose: false, closeOnClick: false, closeButton: false },
    );
  };

  // ---- Edit ---------------------------------------------------------

  const handleEdit = async (taskId) => {
    let data;
    try {
      data = await getSingleTaskData(taskId);
    } catch (err) {
      toast.error("Couldn't load task details.");
      return;
    }

    setIsToastOpen(true);

    const handleSave = async (id, title, description, taskDeadline) => {
      await updateTaskDetails(id, title, description, taskDeadline);
      await fetchWorkspaceDetails();
      toast.dismiss(toastId);
      setIsToastOpen(false);
    };

    const handleCancel = () => {
      toast.dismiss(toastId);
      setIsToastOpen(false);
    };

    const toastId = toast(
      <EditTaskToast
        taskId={data._id}
        initialTitle={data.title}
        initialDescription={data.description}
        initialDeadline={data.deadline ? new Date(data.deadline) : new Date()}
        onSave={handleSave}
        onCancel={handleCancel}
      />,
      { autoClose: false, closeOnClick: false, closeButton: false },
    );
  };

  return (
    <div>
      <Loader isLoading={isLoading} />
      <ToastContainer position="top-center" />
      {isToastOpen && (
        <div className="fixed inset-0 z-20" style={{ background: "rgba(0,0,0,0.05)" }} />
      )}

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        workspaceId={workspace?._id}
        workspaceName={workspace?.name}
      />

      {isTaskModalOpen && (
        <TaskForm
          taskStatus={taskStatus}
          setTaskStatus={setTaskStatus}
          deadline={deadline}
          setDeadline={setDeadline}
          setIsLoading={setIsTaskSubmitting}
          workspaceId={workspace?._id}
          workspaceMembers={members || []}
          onClose={() => setIsTaskModalOpen(false)}
          onTaskAdded={fetchWorkspaceDetails}
        />
      )}

      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6">
        {/* Workspace Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-stone-200 dark:border-gray-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {workspace?.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Workspace Tasks</p>
          </div>

          <div className="flex gap-3">
            {workspace?.role === "owner" && (
              <>
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="px-4 py-2 bg-white dark:bg-gray-800 text-stone-700 dark:text-gray-200 border border-stone-300 dark:border-gray-700 hover:bg-stone-50 dark:hover:bg-gray-700 text-sm font-medium rounded-sm transition-colors shadow-sm"
                >
                  Invite Member
                </button>
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-emerald-50 text-sm font-medium rounded-sm transition-colors shadow-sm"
                >
                  New Task
                </button>
              </>
            )}
          </div>
        </div>

        {/* Task List — shared component, role-gated edit/delete */}
        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          updatingId={updatingId}
          role={workspace?.role}
          onStatusChange={handleStatusChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default WorkspaceDetails;