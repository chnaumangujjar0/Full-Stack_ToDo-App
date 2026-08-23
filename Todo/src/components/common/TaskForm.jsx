import React, { useRef, useState, useEffect, useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { postTask } from "../../Api/api.js";
import StatusDropdown from "./StatusDropdown.jsx";
import { DatePicker } from "./DatePicker.jsx";
import AssigneeDropdown from "./AssigneeDropdown.jsx";
import { X } from "lucide-react";

const validationSchema = Yup.object({
  title: Yup.string().trim().required("Title is required"),
  description: Yup.string().trim().required("Description is required"),
});

const TaskForm = ({
  taskStatus,
  setTaskStatus,
  deadline,
  setDeadline,
  onTaskAdded,
  setIsLoading,
  workspaceId = null,
  workspaceMembers = [],
  assignedTo = null,
  setAssignedTo = () => {},
  onClose = () => {},
}) => {
  const titleInputRef = useRef(null);

  const isWorkspaceContext = Boolean(workspaceId);

  // ---------------------------------------------------------------------
  const [internalAssignedTo, setInternalAssignedTo] = useState(assignedTo);

  useEffect(() => {
    setInternalAssignedTo(assignedTo);
  }, [assignedTo]);

  const handleAssigneeSelect = useCallback(
    (id) => {
      setInternalAssignedTo(id);
      setAssignedTo(id); // keep parent in sync too, if it cares
    },
    [setAssignedTo],
  );

  // Auto-focus the title field when the modal opens, for faster entry.
  useEffect(() => {
    if (isWorkspaceContext) {
      titleInputRef.current?.focus();
    }
    
  }, []);

  
  useEffect(() => {
    if (!isWorkspaceContext) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isWorkspaceContext, onClose]);

  const formik = useFormik({
    initialValues: { title: "", description: "" },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      setIsLoading(true);
      try {
        await postTask(
          values.title.trim(),
          values.description.trim(),
          taskStatus,
          deadline,
          workspaceId,
          internalAssignedTo,
        );
        resetForm();
        setTaskStatus("pending");
        setDeadline(new Date());
        setInternalAssignedTo(null);
        setAssignedTo(null);
        await onTaskAdded?.();
        titleInputRef.current?.focus();

        if (isWorkspaceContext) {
          onClose();
        }
      } catch (error) {
        toast.error("Couldn't save task, try again.");
      } finally {
        setIsLoading(false);
      }
    },
  });

  const formContent = (
    <form
      onSubmit={formik.handleSubmit}
      onClick={(e) => isWorkspaceContext && e.stopPropagation()}
      className={`p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 bg-[#FFFDF8] rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-stone-200 dark:bg-gray-900 dark:border-gray-800 dark:text-white relative ${
        isWorkspaceContext ? "w-full max-w-2xl" : "w-full"
      }`}
    >
      {isWorkspaceContext && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 rounded-sm transition-colors focus:outline-none"
        >
          <X size={20} />
        </button>
      )}

      <p className="text-[11px] tracking-[0.2em] uppercase text-stone-400 font-mono -mb-1 mt-1">
        {isWorkspaceContext ? "New Team Task" : "New Task"}
      </p>

      {/* Title Input */}
      <div>
        <input
          className="h-12 sm:h-14 text-base sm:text-lg bg-transparent outline-0 text-stone-900 placeholder:text-stone-400 px-3 border border-stone-300 focus:border-stone-500 rounded-sm w-full transition-colors dark:text-white"
          ref={titleInputRef}
          type="text"
          name="title"
          placeholder="Enter title"
          value={formik.values.title}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.title && formik.errors.title && (
          <p className="text-red-600 text-xs mt-1">{formik.errors.title}</p>
        )}
      </div>

      {/* Description Textarea */}
      <div>
        <textarea
          className="min-h-24 sm:min-h-28 text-base sm:text-lg bg-transparent outline-0 text-stone-900 placeholder:text-stone-400 px-3 py-3 border border-stone-300 focus:border-stone-500 rounded-sm w-full transition-colors resize-none dark:text-white"
          name="description"
          placeholder="Enter description"
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.description && formik.errors.description && (
          <p className="text-red-600 text-xs mt-1">{formik.errors.description}</p>
        )}
      </div>

      {/* Bottom Controls Row */}
      <div className="flex flex-wrap-reverse md:flex-wrap justify-start gap-3 pt-1">
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-sm text-emerald-50 bg-emerald-800 hover:bg-emerald-900 cursor-pointer transition-colors text-sm tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {formik.isSubmitting ? "Adding..." : "Add task"}
        </button>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] tracking-[0.2em] uppercase text-stone-400 font-mono">
            Task Status
          </label>
          <StatusDropdown
            selectedStatus={taskStatus}
            onSelect={setTaskStatus}
            buttonClass="w-full justify-between"
            disabled={formik.isSubmitting}
          />
        </div>

        <DatePicker date={deadline} setDate={setDeadline} />

        {isWorkspaceContext && (
          <div className="flex flex-col gap-1">
            <label className="text-[11px] tracking-[0.2em] uppercase text-stone-400 font-mono">
              Assign To
            </label>
            <AssigneeDropdown
              members={workspaceMembers}
              selectedAssignee={internalAssignedTo}
              onSelect={handleAssigneeSelect}
              disabled={formik.isSubmitting}
            />
          </div>
        )}
      </div>
    </form>
  );

  if (isWorkspaceContext) {
    return (
      <div
        className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity"
        onClick={onClose}
      >
        {formContent}
      </div>
    );
  }

  return formContent;
};

export default TaskForm;