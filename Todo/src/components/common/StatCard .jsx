import React from "react";

const StatCard = ({ label, value, colorClass }) => (
  <div
    className={`aspect-square border-2 rounded-2xl bg-gray-200 shadow-2xl sm:p-4 lg:p-6 flex flex-col justify-center items-center text-center dark:bg-gray-900 ${colorClass}`}
  >
    <p className="mb-0.5 sm:mb-2 text-[10px] sm:text-sm lg:text-base leading-tight">{label}</p>
    <strong className="text-base sm:text-2xl lg:text-3xl">{value}</strong>
  </div>
);

export default StatCard;