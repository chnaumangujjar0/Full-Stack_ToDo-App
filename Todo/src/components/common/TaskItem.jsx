import React from "react";
import { Link } from "react-router";
import StatusDropdown from "./StatusDropdown.jsx";
import { STATUS_STYLES, STATUS_LABELS } from "./constants.js";

// canManage defaults to true so TaskItem behaves exactly as before if it's
// ever rendered outside TaskList (or in tests) without the prop.
const TaskItem = ({
  task,
  isUpdating,
  onStatusChange,
  onEdit,
  onDelete,
  canManage = true,
}) => (
  <li className="relative w-full flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 bg-[#FFFDF8] rounded-sm px-3 sm:px-6 lg:px-8 py-4 sm:py-5 border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:bg-gray-900 dark:border-gray-700 dark:text-white">
    <div className="flex-1 min-w-0 basis-full sm:basis-auto order-3 sm:order-0">
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <Link to={`/${task._id}`} className="min-w-0">
          <span className="font-serif text-base sm:text-lg text-stone-900 truncate block dark:text-white">
            {task.title}
          </span>
        </Link>
        <span
          className={`text-[10px] tracking-[0.15em] uppercase px-2 py-0.5 rounded-sm shrink-0 ${
            STATUS_STYLES[task.status] || STATUS_STYLES.pending
          }`}
        >
          {STATUS_LABELS[task.status] || task.status}
        </span>
      </div>
      {task.assignedTo && (
        <span className="font-mono text-[10px] tracking-wide px-2 bg-gray-300 rounded-[3px] dark:text-black">
         Assignee: {task?.assignedTo?.username ?? ""}
        </span>
      ) }
    </div>

    <span className="text-sm text-stone-500 shrink-0">
      Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : "—"}
    </span>

    {/* Status updates are allowed for both owner and member — always shown */}
    <StatusDropdown
      selectedStatus={task.status}
      onSelect={(status) => onStatusChange(task._id, status)}
      disabled={isUpdating}
      buttonClass="h-8 px-3"
    />

    {/* Edit/Delete are owner-only actions — the whole group is omitted
        for members rather than shown disabled, since a member has no
        legitimate reason to see these controls at all. */}
    {canManage && (
      <div className="flex items-center gap-2 ml-auto sm:ml-0 z-40">
        <button
          type="button"
          aria-label="Edit task"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-stone-300 text-stone-500 hover:text-stone-800 hover:border-stone-500 flex items-center justify-center transition-colors dark:bg-gray-700 dark:border-gray-800 dark:text-white"
          onClick={() => onEdit(task._id)}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Delete task"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-stone-300 text-stone-500 hover:text-red-600 hover:border-red-300 flex items-center justify-center transition-colors dark:bg-gray-700 dark:border-gray-800 dark:text-white"
          onClick={() => onDelete(task._id)}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    )}
  </li>
);

export default TaskItem;