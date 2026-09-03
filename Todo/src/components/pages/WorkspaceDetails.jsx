import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import {
  fetchWorkspaceTasks,
  getWorkspaceById,
  updateStatus,
  deleteTaskById,
  getSingleTaskData,
  updateTaskDetails,
  removeWorkspaceMember,
  updateMemberRole,
  leaveWorkspace,
} from "@/Api/api";
import InviteMemberModal from "../common/InviteMemberModal";
import TaskForm from "../common/TaskForm";
import TaskList from "../common/TaskList.jsx";
import EditTaskToast from "../common/EditTaskToast.jsx";
import Loader from "../common/Loader.jsx";
import { socket } from "@/socket";

const ROLE_BADGE_STYLES = {
  owner: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  member: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

const flattenMembers = (rawMembers = []) =>
  rawMembers.map((m) => ({
    _id: m.user._id,
    username: m.user.username,
    avatar: m.user.avatar,
    fullName: m.user.fullName,
    role: m.role,
    joinedAt: m.joinedAt,
  }));

const WorkspaceDetails = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskStatus, setTaskStatus] = useState("pending");
  const [deadline, setDeadline] = useState(new Date());
  const [isTaskSubmitting, setIsTaskSubmitting] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isRemovingMember, setIsRemovingMember] = useState("");
  const [isChangingRoleFor, setIsChangingRoleFor] = useState("");
  const [isLeaving, setIsLeaving] = useState(false);

  const isOwner = workspace?.role === "owner";
  const isAdmin = workspace?.role === "admin";
  const canManage = isOwner || isAdmin;

  const fetchWorkspaceDetails = async () => {
    setIsLoading(true);
    try {
      const ws = await getWorkspaceById(workspaceId);

      if (!ws?._id) {
        toast.error("Workspace not found or you don't have access.");
        setWorkspace(null);
        setMembers([]);
        setTasks([]);
        return;
      }

      setWorkspace(ws);
      setMembers(flattenMembers(ws.members));

      const taskData = await fetchWorkspaceTasks(workspaceId);
      setTasks(Array.isArray(taskData) ? taskData : []);
    } catch (err) {
      toast.error("Couldn't load workspace, try again.");
      setWorkspace(null);
      setMembers([]);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceDetails();

    const joinWorkspaceRoom = () => {
      if (workspaceId) {
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

    const handleNewMember = (newMember) => {
      setMembers((prev) => {
        const isDuplicate = prev.some((member) => member._id === newMember._id);
        if (isDuplicate) return prev;
        return [newMember, ...prev];
      });
    };

    const handleMemberRemoved = ({ memberId }) => {
      setMembers((prev) => prev.filter((m) => m._id !== memberId));
    };

    const handleKicked = (payload) => {
      if (payload?.workspaceId !== workspaceId) return;
      toast.error(payload?.message || "You were removed from this workspace.");
      navigate("/workspaces");
    };

    const handleNewTask = (todo) => {
      setTasks((prev) => {
        const isDuplicate = prev.some((task) => task._id === todo._id);
        if (isDuplicate) return prev;
        return [...prev, todo];
      });
    };

    socket.on("task_status_updated", handleStatusUpdate);
    socket.on("invite_response", handleNewMember);
    socket.on("member_removed", handleMemberRemoved);
    socket.on("kicked_from_workspace", handleKicked);
    socket.on("new_task", handleNewTask);

    return () => {
      socket.off("connect", joinWorkspaceRoom);
      socket.off("task_status_updated", handleStatusUpdate);
      socket.off("invite_response", handleNewMember);
      socket.off("member_removed", handleMemberRemoved);
      socket.off("kicked_from_workspace", handleKicked);
      socket.off("new_task", handleNewTask);

      if (workspaceId) {
        socket.emit("leave_workspace", workspaceId);
      }
    };
  }, [workspaceId]);

  const handleStatusChange = async (taskId, status) => {
    setUpdatingId(taskId);
    try {
      await updateStatus(taskId, status);
    } catch (err) {
      toast.error("Couldn't update task status, try again.");
    } finally {
      setUpdatingId("");
    }
  };

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
      { autoClose: false, closeOnClick: false, closeButton: false }
    );
  };

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
      { autoClose: false, closeOnClick: false, closeButton: false }
    );
  };

  const handleRemoveMember = async (memberId) => {
    setIsRemovingMember(memberId);
    try {
      await removeWorkspaceMember(workspaceId, memberId);
      setMembers((prev) => prev.filter((m) => m._id !== memberId));
      toast.success("Member removed from workspace");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove member");
    } finally {
      setIsRemovingMember("");
    }
  };

  const handleToggleRole = async (member) => {
    const nextRole = member.role === "admin" ? "member" : "admin";
    setIsChangingRoleFor(member._id);
    try {
      await updateMemberRole(workspaceId, member._id, nextRole);
      setMembers((prev) =>
        prev.map((m) => (m._id === member._id ? { ...m, role: nextRole } : m))
      );
      toast.success(
        nextRole === "admin"
          ? `${member.username} is now an admin`
          : `${member.username} is now a member`
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update role");
    } finally {
      setIsChangingRoleFor("");
    }
  };

  const handleLeaveWorkspace = async () => {
    setIsLeaving(true);
    try {
      await leaveWorkspace(workspaceId);
      toast.success("You left the workspace.");
      navigate("/workspace");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to leave workspace");
    } finally {
      setIsLeaving(false);
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
        onSuccess={() => toast.success(`Invite sent Successfully!`)}
      />

      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 bg-opacity-50 p-4 sm:p-6">
          <div className="bg-white dark:bg-gray-800 rounded-sm shadow-lg w-full max-w-md p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4 sm:mb-5 border-b border-gray-100 dark:border-gray-700 pb-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Members</h2>
              <button onClick={() => setIsManageModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {members?.length > 0 ? (
                members.map((member) => {
                  const canChangeRole = isOwner && member.role !== "owner";
                  const canRemove = canManage && member.role !== "owner";

                  return (
                    <div key={member._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 border border-stone-200 dark:border-gray-700 rounded-sm hover:bg-stone-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <img
                          src={member.avatar || "https://images.unsplash.com/photo-1740252117044-2af197eea287?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
                          alt={member.username}
                          className="w-8 h-8 rounded-full object-cover border border-stone-200 flex-shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-stone-800 dark:text-gray-200 truncate">{member.username}</span>
                          <span
                            className={`w-fit text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full mt-0.5 ${
                              ROLE_BADGE_STYLES[member.role] ?? ROLE_BADGE_STYLES.member
                            }`}
                          >
                            {member.role}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {canChangeRole && (
                          <button
                            onClick={() => handleToggleRole(member)}
                            disabled={isChangingRoleFor === member._id}
                            className="flex-1 sm:flex-none text-xs font-medium px-3 py-1.5 bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 rounded-sm transition-colors disabled:opacity-50 whitespace-nowrap text-center"
                          >
                            {isChangingRoleFor === member._id
                              ? "..."
                              : member.role === "admin"
                                ? "Demote"
                                : "Promote"}
                          </button>
                        )}
                        {canRemove && (
                          <button
                            onClick={() => handleRemoveMember(member._id)}
                            disabled={isRemovingMember === member._id}
                            className="flex-1 sm:flex-none text-xs font-medium px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-sm transition-colors disabled:opacity-50 border border-red-100 dark:border-red-900/50 whitespace-nowrap text-center"
                          >
                            {isRemovingMember === member._id ? "..." : "Remove"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
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

      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4 border-b border-stone-200 dark:border-gray-800 pb-5 md:pb-6">
          <div className="w-full md:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
              {workspace?.name}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Workspace Tasks</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto mt-2 md:mt-0">
            <button
              onClick={() => setIsManageModalOpen(true)}
              className="flex-1 md:flex-none justify-center whitespace-nowrap px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 text-stone-700 dark:text-gray-200 border border-stone-300 dark:border-gray-700 hover:bg-stone-50 dark:hover:bg-gray-700 text-xs sm:text-sm font-medium rounded-sm transition-colors shadow-sm"
            >
              Members
            </button>

            {canManage && (
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="flex-1 md:flex-none justify-center whitespace-nowrap px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 text-stone-700 dark:text-gray-200 border border-stone-300 dark:border-gray-700 hover:bg-stone-50 dark:hover:bg-gray-700 text-xs sm:text-sm font-medium rounded-sm transition-colors shadow-sm"
              >
                Invite
              </button>
            )}

            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="flex-1 md:flex-none justify-center whitespace-nowrap px-3 sm:px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-emerald-50 text-xs sm:text-sm font-medium rounded-sm transition-colors shadow-sm"
            >
              New Task
            </button>

            {!isOwner && workspace && (
              <button
                onClick={handleLeaveWorkspace}
                disabled={isLeaving}
                className="flex-1 md:flex-none justify-center whitespace-nowrap px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs sm:text-sm font-medium rounded-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {isLeaving ? "..." : "Leave"}
              </button>
            )}
          </div>
        </div>

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