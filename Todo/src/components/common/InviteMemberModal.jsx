import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
 import { sendInvite } from "../../Api/api.js"; // Your future API function

const InviteMemberModal = ({ isOpen, onClose, workspaceId, workspaceName }) => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }
    setIsLoading(true);
    
    sendInvite(workspaceId,username)
    .then((res) => {
        toast.success(`Invite sent to ${username.trim()}!`);
        setUsername("");
        onClose(); 
    })
    .catch( (error) => {
    console.error(error);
    const errorMsg = error.response?.data?.message || "Failed to send invite.";
    toast.error(errorMsg);
    }).finally(
        setIsLoading(false)
    )
  };

  return (
    <>
    <ToastContainer position="top-left"/>
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-[#FFFDF8] dark:bg-gray-900 border border-stone-200 dark:border-gray-800 rounded-sm shadow-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 dark:hover:text-gray-200 transition-colors focus:outline-none"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Invite Teammate
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Invite a user to collaborate in <span className="font-semibold text-stone-700 dark:text-gray-300">{workspaceName}</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="username" className="block text-[11px] tracking-[0.2em] uppercase text-stone-400 font-mono mb-2">
              Exact Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                @
              </span>
              <input
                id="username"
                type="text"
                autoFocus
                placeholder="developer_name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 sm:h-14 text-base bg-transparent outline-0 text-stone-900 placeholder:text-stone-400 pl-8 pr-3 border border-stone-300 focus:border-stone-500 rounded-sm w-full transition-colors dark:text-white dark:border-gray-700 dark:focus:border-gray-500"
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-stone-500 mt-2">
              The user will receive a notification to accept or decline your request.
            </p>
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
                "Send Invite"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default InviteMemberModal;