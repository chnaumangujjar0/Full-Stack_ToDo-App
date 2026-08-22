import { getWorkspaceById } from "@/Api/api";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router"; 
import InviteMemberModal from "../common/InviteMemberModal";
import TaskForm from "../common/TaskForm";
import Loader from "../common/Loader.jsx";

const WorkspaceDetails = () => {
  const { workspaceId } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [tasks, setTasks] = useState([]);
  
  // Page Loading State
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal Visibility States
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false); // NEW: Controls the Task Modal
  
  // Task Form States
  const [taskStatus, setTaskStatus] = useState("pending");
  const [deadline, setDeadline] = useState(new Date());
  const [isTaskSubmitting, setIsTaskSubmitting] = useState(false); // NEW: Prevents full-page unmount on submit
  const [members,setMembers] = useState([])
  // Reusable fetch function so we can call it after adding a new task
  const fetchWorkspaceDetails = async () => {
    setIsLoading(true);
    try {
      const res = await getWorkspaceById(workspaceId);
      console.log(res?.[0]);
      setWorkspace(res?.[0]);
      setMembers(res?.[0].membersDetails)
      
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceDetails();
  }, [workspaceId]);

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };


  return (
    <div>
      <Loader isLoading={isLoading}/>
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
          setIsLoading={setIsTaskSubmitting} // Passed separate loading state
          workspaceId={workspace?._id}
          workspaceMembers={workspace?.memberDetails} // Added fallback array
          onClose={() => setIsTaskModalOpen(false)} // Pass the close function
          onTaskAdded={() => {
            // Instantly refresh the workspace data to show the new task
            fetchWorkspaceDetails();
          }}
        />
      )}

      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6">
        {/* Workspace Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-stone-200 dark:border-gray-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {workspace?.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Workspace Tasks
            </p>
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
                {/* BUG FIX: Added onClick to open the Task Modal */}
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

        {/* Vertical Task List */}
        <div className="bg-[#FFFDF8] dark:bg-gray-900 border border-stone-200 dark:border-gray-800 rounded-sm shadow-sm overflow-hidden">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-stone-500 dark:text-gray-400">
              No tasks in this workspace yet.
            </div>
          ) : (
            <div className="divide-y divide-stone-200 dark:divide-gray-800">
              {tasks.map((task) => (
                <div key={task._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50 dark:hover:bg-gray-800/50 transition-colors">
                  
                  {/* Title & Status */}
                  <div className="flex flex-col gap-2 sm:w-1/2">
                    <span className="text-base font-semibold text-stone-900 dark:text-white">
                      {task.title}
                    </span>
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        task.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-stone-200 text-stone-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>

                  {/* Assignment & Deadline */}
                  <div className="flex flex-row items-center justify-between sm:justify-end sm:w-1/2 gap-6 text-sm text-stone-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] tracking-[0.1em] uppercase text-stone-400 font-mono hidden sm:inline">
                        Assignee:
                      </span>
                      <span className={task.assignedTo ? "font-medium text-stone-800 dark:text-gray-200" : "italic text-stone-400"}>
                        {task.assignedTo ? task.assignedTo.username : "Unassigned"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 min-w-[100px] justify-end">
                      <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDate(task.deadline)}</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceDetails;