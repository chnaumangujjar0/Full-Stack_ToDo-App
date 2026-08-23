import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { X } from "lucide-react";
// TODO: confirm the real export name/signature for updating a workspace
import { updateWorkspace } from "@/Api/api";

const UpdateWorkspaceModal = ({ isOpen, onClose, workspaceId, initialName, onSuccess }) => {
  const [name, setName] = useState(initialName || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(initialName || "");
    setError("");
  }, [initialName, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(name)
    if (!name.trim()) {
      setError("Workspace name is required");
      return;
    }
    
    setError("");
    setSaving(true);
    try {
      await updateWorkspace(workspaceId, name);
      toast.success("Workspace updated.");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.log(err)
      setError("Couldn't update workspace, try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm p-5 sm:p-6 flex flex-col gap-4 bg-[#FFFDF8] dark:bg-gray-900 border border-stone-200 dark:border-gray-800 rounded-sm shadow-lg"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 rounded-sm transition-colors"
        >
          <X size={18} />
        </button>

        <p className="text-[11px] tracking-[0.2em] uppercase text-stone-400 font-mono">
          Rename Workspace
        </p>

        <input
          autoFocus
          className="h-11 px-3 border border-stone-300 rounded-sm text-stone-900 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:border-stone-500 transition-colors text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Workspace name"
        />
        {error && <p className="text-red-600 text-xs">{error}</p>}

        <div className="flex gap-2 justify-end mt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-1.5 rounded-sm border border-stone-300 text-stone-600 text-sm hover:border-stone-500 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-1.5 rounded-sm bg-emerald-800 text-white text-sm hover:bg-emerald-900 transition-colors disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateWorkspaceModal;