import React from "react";
import StatCard from "./StatCard ";

const StatsPanel = ({ stats }) => (
  <div className="p-4 sm:p-6 lg:p-8 bg-[#FFFDF8] rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-stone-200 w-full h-full flex items-center justify-center dark:bg-gray-900 dark:border-gray-800">
    <div className="grid grid-cols-4 gap-2 w-full">
      <StatCard label="Total" value={stats.total} colorClass="border-indigo-900 text-indigo-900" />
      <StatCard label="Completed" value={stats.completed} colorClass="border-emerald-800 text-emerald-800" />
      <StatCard label="Pending" value={stats.pending} colorClass="border-amber-800 text-amber-800" />
      <StatCard label="InProgress" value={stats.inProgress} colorClass="border-amber-800 text-amber-800" />
    </div>
  </div>
);

export default StatsPanel;