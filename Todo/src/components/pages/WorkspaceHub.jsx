import React, { useState, useEffect } from "react";

import { Link } from "react-router"; 

const WorkspaceHub = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Placeholder for your actual API fetch
  useEffect(() => {
    const fetchWorkspaces = async () => {
      // Mock data for UI testing
      setTimeout(() => {
        setWorkspaces([
          { _id: "1", name: "Frontend Project", role: "owner", membersCount: 3 },
          { _id: "2", name: "Backend APIs", role: "member", membersCount: 5 },
        ]);
        setIsLoading(false);
      }, 800);
    };
    fetchWorkspaces();
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Workspaces</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your teams and shared projects.
          </p>
        </div>
        <button className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-emerald-50 text-sm font-medium rounded-sm transition-colors shadow-sm">
          + Create Workspace
        </button>
      </div>

      {/* Grid Section */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : workspaces.length === 0 ? (
        <div className="text-center py-12 bg-[#FFFDF8] border border-stone-200 dark:bg-gray-900 dark:border-gray-800 rounded-sm">
          <p className="text-stone-500 dark:text-gray-400">You haven't joined any workspaces yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {workspaces.map((workspace) => (
            // Replace <div> with <Link to={`/workspace/${workspace._id}`}> if using React Router
            <Link to={`/workspace/${workspace._id}`}
              key={workspace._id}
              className="group flex flex-col justify-between p-5 bg-[#FFFDF8] dark:bg-gray-900 border border-stone-200 dark:border-gray-800 rounded-sm shadow-sm hover:shadow-md hover:border-emerald-500/50 dark:hover:border-emerald-500/50 cursor-pointer transition-all h-40"
            >
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-semibold text-stone-900 dark:text-white truncate pr-2">
                  {workspace.name}
                </h2>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                  workspace.role === "owner" 
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                }`}>
                  {workspace.role}
                </span>
              </div>
              
              <div className="flex justify-between items-end mt-4">
                <div className="text-sm text-stone-500 dark:text-gray-400 font-medium">
                  {workspace.membersCount} Members
                </div>
                <div className="text-stone-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkspaceHub;