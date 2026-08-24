import React from "react";
import TaskItem from "./TaskItem.jsx";


const TaskList = ({
  tasks,
  isLoading,
  updatingId,
  onStatusChange,
  onEdit,
  onDelete,
  role = "owner",
}) => {
  
  const canManage = role === "owner";

  return (
    <div className="z-0 max-w-7xl mx-auto bg-stone-100 mt-0 flex justify-start px-3 sm:px-5 dark:bg-gray-800 dark:border-gray-800">
      <ul className="pb-10 flex flex-col gap-3 sm:gap-4 w-full mx-auto bg-stone-100 dark:bg-gray-800 dark:border-gray-800">
        {!isLoading && tasks.length === 0 ? (
          <div className="bg-white rounded-sm shadow-sm border border-stone-200 p-10 text-center text-stone-500 text-sm">
            No tasks found.
          </div>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              isUpdating={updatingId === task._id}
              onStatusChange={onStatusChange}
              onEdit={onEdit}
              onDelete={onDelete}
              canManage={canManage}
            />
          ))
        )}
      </ul>
    </div>
  );
};

export default TaskList;