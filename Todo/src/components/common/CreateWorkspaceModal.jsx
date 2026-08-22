import { createWorkspace } from "@/Api/api";
import React, { useState } from "react";
import { toast } from "react-toastify";
// import { createWorkspace } from "../../Api/api.js"; // Your future API function

const CreateWorkspaceModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
    
  // If the modal is not commanded to be open, render absolutely nothing.
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    setIsLoading(true);
    try {
      if(name.trim() == ""){
        toast.error("workspace name is required!")
        return;
      }
      await createWorkspace(name)
      
      toast.success("Workspace created successfully!");
      setName(""); // Clear input
      onSuccess?.(); // Tell the parent component to refresh the workspace list
      onClose(); // Close the modal
    } catch (error) {
      console.error(error);
      toast.error("Failed to create workspace. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    /* BACKDROP OVERLAY: Covers the entire screen. Clicking it triggers onClose() */
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity"
      onClick={onClose}
    >
      {/* MODAL BOX: e.stopPropagation() prevents clicks inside the box from closing the modal */}
      <div 
        className="relative w-full max-w-md bg-[#FFFDF8] dark:bg-gray-900 border border-stone-200 dark:border-gray-800 rounded-sm shadow-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button (X) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 dark:hover:text-gray-200 transition-colors focus:outline-none"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Create Workspace
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Give your new team or project a name.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="workspaceName" className="block text-[11px] tracking-[0.2em] uppercase text-stone-400 font-mono mb-2">
              Workspace Name
            </label>
            <input
              id="workspaceName"
              type="text"
              autoFocus
              placeholder="e.g., Frontend Team, Project Alpha"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 sm:h-14 text-base bg-transparent outline-0 text-stone-900 placeholder:text-stone-400 px-3 border border-stone-300 focus:border-stone-500 rounded-sm w-full transition-colors dark:text-white dark:border-gray-700 dark:focus:border-gray-500"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-sm text-stone-600 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-sm text-emerald-50 bg-emerald-800 hover:bg-emerald-900 transition-colors text-sm font-medium shadow-sm flex items-center justify-center min-w-[120px] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Create"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;