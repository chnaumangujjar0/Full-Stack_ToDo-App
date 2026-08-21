import React, { useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { postTask } from "../../Api/api.js";
import StatusDropdown from "./StatusDropdown.jsx";
import { DatePicker } from "./DatePicker.jsx";
// You will need to create this new component, similar to StatusDropdown
import AssigneeDropdown from "./AssigneeDropdown.jsx"; 

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
  // NEW PROPS FOR COLLABORATION
  workspaceId = null, 
  workspaceMembers = [], 
  assignedTo = null,
  setAssignedTo = () => {},
}) => {
  const titleInputRef = useRef(null);

  const formik = useFormik({
    initialValues: { title: "", description: "" },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      setIsLoading(true);
      try {
        // We now pass the new fields to your API function
        await postTask(
          values.title.trim(), 
          values.description.trim(), 
          taskStatus, 
          deadline,
          workspaceId, // Will be null if it's a personal task
          assignedTo   // Will be null if unassigned
        );
        resetForm();
        setTaskStatus("pending");
        setDeadline(new Date());
        setAssignedTo(null); // Reset assignment
        await onTaskAdded?.();
        titleInputRef.current?.focus();
      } catch (error) {
        toast.error("Couldn't save task, try again.");
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Check if we are inside a workspace with members
  const isWorkspaceContext = workspaceMembers && workspaceMembers.length > 0;

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 w-full bg-[#FFFDF8] rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-stone-200 dark:bg-gray-900 dark:border-gray-800 dark:text-white"
    >
      <p className="text-[11px] tracking-[0.2em] uppercase text-stone-400 font-mono -mb-1">
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
          Add task
        </button>
        
        <div className="flex flex-col gap-1">
          <label className="text-[11px] tracking-[0.2em] uppercase text-stone-400 font-mono">
            Task Status
          </label>
          <StatusDropdown
            selectedStatus={taskStatus}
            onSelect={setTaskStatus}
            buttonClass="w-full justify-between"
          />
        </div>

        <DatePicker date={deadline} setDate={setDeadline} />

        {/* NEW: Conditional Assignee Dropdown */}
        {isWorkspaceContext && (
          <div className="flex flex-col gap-1">
            <label className="text-[11px] tracking-[0.2em] uppercase text-stone-400 font-mono">
              Assign To
            </label>
            <AssigneeDropdown
              members={workspaceMembers}
              selectedAssignee={assignedTo}
              onSelect={setAssignedTo}
            />
          </div>
        )}
      </div>
    </form>
  );
};

export default TaskForm;