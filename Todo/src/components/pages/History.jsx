import React, { useState, useEffect } from "react";
import { getAllTasks } from "../../Api/api.js";
import Loader from "../common/Loader.jsx";

const History = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  useEffect(() => {
    setIsLoading(true);
    getAllTasks()
      .then((res) => setTasks(res))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredTasks = tasks.filter((t) => {
    if (!t.createdAt) return false;
    const taskDate = new Date(t.createdAt).toISOString().split("T")[0];
    return taskDate === selectedDate;
  });

  return (
    <>
      <Loader isLoading={isLoading} />

      <div className="max-w-7xl mx-auto bg-stone-100 px-3 sm:px-5 pt-6 sm:pt-10 pb-6">
        <div className="p-4 sm:p-6 bg-[#FFFDF8] rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-stone-200 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-stone-400 font-mono mb-1">
              History
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl text-stone-900">
              Tasks by date
            </h1>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] tracking-[0.15em] uppercase text-stone-400 font-mono">
              Select date
            </label>
            <input
              type="date"
              value={selectedDate}
              max={todayStr}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-11 px-3 border border-stone-300 rounded-sm text-stone-900 bg-transparent focus:border-stone-500 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto bg-stone-100 px-3 sm:px-5 pb-10">
        {filteredTasks.length === 0 ? (
          <div className="bg-[#FFFDF8] rounded-sm border border-stone-200 p-10 text-center text-stone-400 text-sm">
            No tasks found for this date.
          </div>
        ) : (
          <ul className="flex flex-col gap-3 sm:gap-4">
            {filteredTasks.map((obj) => (
              <li
                key={obj._id}
                className="relative w-full flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 bg-[#FFFDF8] rounded-sm px-3 sm:px-6 lg:px-8 py-4 sm:py-5 border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden"
              >
                <div
                  className={`w-6 h-6 shrink-0 rounded-full border-2 border-stone-400 ${
                    obj.completed ? "bg-stone-900 border-stone-900" : "bg-transparent"
                  }`}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span className="font-serif text-base sm:text-lg text-stone-900 truncate">
                      {obj.title}
                    </span>
                    <span
                      className={`text-[10px] tracking-[0.15em] uppercase px-2 py-0.5 rounded-sm shrink-0 ${
                        obj.completed ? "bg-emerald-800 text-emerald-50" : "bg-amber-600 text-amber-50"
                      }`}
                    >
                      {obj.completed ? "Completed" : "Incomplete"}
                    </span>
                  </div>
                  <p className="text-sm text-stone-600 mt-1 truncate">{obj.description}</p>
                </div>

                <span className="text-[11px] font-mono text-stone-400 shrink-0">
                  {new Date(obj.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default History;