import React from "react";
import { Link } from "react-router";
import StatusDropdown from "./StatusDropdown.jsx";
import { STATUS_STYLES, STATUS_LABELS } from "./constants.js";
import { SquarePen, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext.jsx";

const TaskItem = ({
  task,
  isUpdating,
  onStatusChange,
  onEdit,
  onDelete,
  canManage = true,
}) => {
  const {user} = useAuth()
  return(
    <li className="relative z-10 w-full flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 bg-[#FFFDF8] rounded-sm px-3 sm:px-6 lg:px-8 py-4 sm:py-5 border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:bg-gray-900 dark:border-gray-700 dark:text-white">
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
      {
        task.assignedTo ? (task.assignedTo._id == user._id || task.assignedTo == "none" || task.owner.toString() == user._id.toString() ) && (
          <StatusDropdown
            selectedStatus={task.status}
            onSelect={(status) => onStatusChange(task._id, status)}
            disabled={isUpdating}
            buttonClass="h-8 px-3 "
          />
        ):
        (
          <StatusDropdown
            selectedStatus={task.status}
            onSelect={(status) => onStatusChange(task._id, status)}
            disabled={isUpdating}
            buttonClass="h-8 px-3 "
          />
        )
      }

      
      {canManage && (
        <div className="flex items-center gap-2 ml-auto sm:ml-0 z-40">
          <button
            type="button"
            aria-label="Edit task"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-stone-300 text-stone-500 hover:text-stone-800 hover:border-stone-500 flex items-center justify-center transition-colors dark:bg-gray-700 dark:border-gray-800 dark:text-white"
            onClick={() => onEdit(task._id)}
          >
            <SquarePen size={16}/>
          </button>
          <button
            type="button"
            aria-label="Delete task"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-stone-300 text-stone-500 hover:text-red-600 hover:border-red-300 flex items-center justify-center transition-colors dark:bg-gray-700 dark:border-gray-800 dark:text-white"
            onClick={() => onDelete(task._id)}
          >
            <X size={16}/>
          </button>
        </div>
      )}
    </li>
)}

export default TaskItem;