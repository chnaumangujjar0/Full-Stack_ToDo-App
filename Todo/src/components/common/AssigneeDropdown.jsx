import React, { useState, useEffect, useRef } from "react";

const AssigneeDropdown = ({ members = [], selectedAssignee, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 1. Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Find the selected member's object so we can display their username
  const selectedMember = members.find((m) => m._id === selectedAssignee);

  return (
    <div className="relative min-w-[140px]" ref={dropdownRef}>
      {/* DROPDOWN BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full h-12 sm:h-14 px-3 text-base sm:text-lg text-stone-900 bg-transparent border border-stone-300 rounded-sm focus:border-stone-500 transition-colors dark:text-white dark:border-gray-700 hover:bg-stone-50 dark:hover:bg-gray-800"
      >
        <span className="truncate">
          {selectedMember ? selectedMember.username : "Unassigned"}
        </span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute z-[999] w-full mt-1 bg-white border border-stone-200 shadow-lg rounded-sm dark:bg-gray-900 dark:border-gray-700 overflow-hidden">
          <ul className="py-1 max-h-48 overflow-y-auto">
            
            {/* UNASSIGNED OPTION */}
            <li
              onClick={() => {
                onSelect(null);
                setIsOpen(false);
              }}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-stone-100 dark:hover:bg-gray-800 transition-colors ${
                selectedAssignee === null 
                  ? "text-stone-500 italic bg-stone-50 dark:bg-gray-800/50" 
                  : "text-stone-700 dark:text-gray-400"
              }`}
            >
              Unassigned
            </li>

            {/* MEMBER LIST OPTIONS */}
            {members.map((member) => (
              <li
                key={member._id}
                onClick={() => {
                  onSelect(member._id);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-stone-100 dark:hover:bg-gray-800 transition-colors ${
                  selectedAssignee === member._id
                    ? "text-emerald-700 font-medium bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20"
                    : "text-stone-900 dark:text-gray-200"
                }`}
              >
                {member.username}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AssigneeDropdown;