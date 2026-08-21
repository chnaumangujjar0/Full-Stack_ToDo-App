import React from "react";

const TaskFilters = ({ statusFilter, onStatusFilterChange, dateFilter, onDateFilterChange }) => (
  <div className="max-w-7xl mx-auto px-3 py-2 sm:px-5 flex flex-col justify-between align-middle md:flex-row">
    <h1 className="p-2 text-2xl sm:text-3xl md:text-4xl">Tasks</h1>
    <div className="flex gap-3 justify-end">
      <div className="flex flex-col">
        <label className="text-[11px] tracking-[0.2em] uppercase text-stone-400 font-mono">
          Filter by Status
        </label>
        <select
          value={statusFilter}
          onChange={onStatusFilterChange}
          className="h-8 px-1 sm:px-2 md:px-3 border border-stone-300 rounded-sm text-stone-900 bg-[#FFFDF8] focus:border-stone-500 transition-colors text-sm cursor-pointer dark:bg-gray-900 dark:border-gray-800 dark:text-white"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In-progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-[11px] tracking-[0.2em] uppercase text-stone-400 font-mono">
          Filter by date
        </label>
        <select
          value={dateFilter}
          onChange={onDateFilterChange}
          className="h-8 px-1 sm:px-2 md:px-3 border border-stone-300 rounded-sm text-stone-900 bg-[#FFFDF8] focus:border-stone-500 transition-colors text-sm cursor-pointer dark:bg-gray-900 dark:border-gray-800 dark:text-white"
        >
          <option value="all">All</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
        </select>
      </div>
    </div>
  </div>
);

export default TaskFilters;