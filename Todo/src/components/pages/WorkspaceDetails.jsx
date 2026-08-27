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
  removeWorkspaceMember
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

  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isRemovingMember, setIsRemovingMember] = useState("");

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

        return [ ...prev,todo];
      });
    };

    socket.on("task_status_updated", handleStatusUpdate);
    socket.on("invite_response", handleNewMember);
    socket.on("new_task", handleNewTask);

    return () => {
      socket.off("task_status_updated", handleStatusUpdate);
      socket.off("invite_response", handleNewMember); 
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

  // 👉 2. Add the function to remove a member
  const handleRemoveMember = async (memberId) => {
    setIsRemovingMember(memberId);
    try {
      await removeWorkspaceMember(workspaceId, memberId);
      
      // Instantly remove them from the UI without reloading
      setMembers((prev) => prev.filter((m) => m._id !== memberId));
      toast.success("Member removed from workspace");
      
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove member");
    } finally {
      setIsRemovingMember("");
    }
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
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-sm shadow-lg w-full max-w-md p-5 sm:p-6">
            <div className="flex justify-between items-center mb-5 border-b border-gray-100 dark:border-gray-700 pb-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Members</h2>
              <button onClick={() => setIsManageModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {members?.length > 0 ? (
                members.map((member) => (
                  <div key={member._id} className="flex items-center justify-between p-2.5 border border-stone-200 dark:border-gray-700 rounded-sm hover:bg-gray-300 dark:hover:bg-gray-600  transition-colors">
                    <div className="flex items-center gap-3">
                      <img 
                        src={member.avatar || "https://images.unsplash.com/photo-1740252117044-2af197eea287?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"} 
                        alt={member.username} 
                        className="w-8 h-8 rounded-full object-cover border border-stone-200" 
                      />
                      <span className="text-sm font-medium text-stone-800 dark:text-gray-200">{member.username}</span>
                    </div>
                    
                    {/* Only show remove button if this member is NOT the owner */}
                    {workspace?.owner !== member._id && (
                      <button
                        onClick={() => handleRemoveMember(member._id)}
                        disabled={isRemovingMember === member._id}
                        className="text-xs font-medium px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-sm transition-colors disabled:opacity-50 border border-red-100 dark:border-red-900/50"
                      >
                        {isRemovingMember === member._id ? "Removing..." : "Remove"}
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-stone-500 text-center py-6">No other members in this workspace.</p>
              )}
            </div>
          </div>
        </div>
      )}
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
                  onClick={() => setIsManageModalOpen(true)}
                  className="px-4 py-2 bg-white dark:bg-gray-800 text-stone-700 dark:text-gray-200 border border-stone-300 dark:border-gray-700 hover:bg-stone-50 dark:hover:bg-gray-700 text-sm font-medium rounded-sm transition-colors shadow-sm"
                >
                  Manage Members
                </button>
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