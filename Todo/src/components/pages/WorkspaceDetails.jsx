import React, { useState, useEffect } from "react";
import { useParams } from "react-router"; // To get workspaceId from URL

const WorkspaceDetails = () => {
   const { workspaceId } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock fetching workspace details and its tasks
  useEffect(() => {
    setTimeout(() => {
      setWorkspace({ _id: "1", name: "Frontend Project", role: "owner" });
      setTasks([
        { _id: "101", title: "Build Navbar", status: "completed", deadline: "2026-08-25T00:00:00.000Z", assignedTo: { username: "Zohaib Khalid" } },
        { _id: "102", title: "Setup Redux Store", status: "in-progress", deadline: "2026-08-28T00:00:00.000Z", assignedTo: null },
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
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
            <button className="px-4 py-2 bg-white dark:bg-gray-800 text-stone-700 dark:text-gray-200 border border-stone-300 dark:border-gray-700 hover:bg-stone-50 dark:hover:bg-gray-700 text-sm font-medium rounded-sm transition-colors shadow-sm">
              Invite Member
            </button>
          )}
          <button className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-emerald-50 text-sm font-medium rounded-sm transition-colors shadow-sm">
            New Task
          </button>
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
  );
};

export default WorkspaceDetails;