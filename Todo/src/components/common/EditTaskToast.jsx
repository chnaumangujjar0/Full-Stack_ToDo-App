import React, { useState } from "react";
import { DatePicker } from "./DatePicker.jsx";

const EditTaskToast = ({
  taskId,
  initialTitle,
  initialDescription,
  initialDeadline,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [deadline, setDeadline] = useState(initialDeadline || new Date());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleUpdate = async () => {
    if (!title.trim() || !description.trim()) {
      setError("Both fields are required");
      return;
    }
    if (!deadline) {
      setError("Deadline is required");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSave(taskId, title.trim(), description.trim(), deadline);
    } catch (err) {
      setError("Couldn't update task, try again.");
      setSaving(false);
    }
  };

  return (
    <div className=" flex flex-col gap-3 m-4 w-64 sm:w-72 ">
      <p className="text-[11px] tracking-[0.2em] uppercase text-stone-400 font-mono">Edit task</p>
      <div>
        <DatePicker date={deadline} setDate={setDeadline} />
      </div>
      <input
        className="h-11 px-3 border border-stone-300 rounded-sm text-stone-900 bg-white focus:border-stone-500 transition-colors text-sm"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <textarea
        className="min-h-24 sm:min-h-28 border p-3 border-stone-300 rounded-sm text-stone-900 bg-white focus:border-stone-500 transition-colors text-sm resize-none"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />

      {error && <p className="text-red-600 text-xs">{error}</p>}
      <div className="flex gap-2 justify-end mt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-1.5 rounded-sm border border-stone-300 text-stone-600 text-sm hover:border-stone-500 transition-colors disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={handleUpdate}
          className="px-4 py-1.5 rounded-sm bg-emerald-800 text-white text-sm hover:bg-emerald-900 transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : "Update"}
        </button>
      </div>
    </div>
  );
};

export default EditTaskToast;