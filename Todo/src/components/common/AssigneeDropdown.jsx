import { ChevronUp } from "lucide-react";
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

  // 2. Find the selected member's object so we can display their data
  const selectedMember = members.find((m) => m._id === selectedAssignee);

  return (
    <div className="relative min-w-[140px] w-full" ref={dropdownRef}>
      {/* DROPDOWN BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full gap-2  px-3 text-base sm:text-lg text-stone-900 bg-transparent border border-stone-300 rounded-sm focus:border-stone-500 transition-colors dark:text-white dark:border-gray-700 hover:bg-stone-50 dark:hover:bg-gray-800"
      >
        <div className="flex items-center gap-2.5 truncate">
          {selectedMember ? (
            <>
              {/* If they have a Cloudinary avatar, use it. Otherwise, fallback to initial */}
              {selectedMember.avatar ? (
                <img 
                  src={selectedMember.avatar} 
                  alt={selectedMember.username} 
                  className="w-6 h-6 rounded-full object-cover border border-stone-200 dark:border-gray-700 bg-stone-100"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                  {selectedMember.username.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="truncate">{selectedMember.username}</span>
            </>
          ) : (
            <>
              {/* Unassigned State inside Button */}
              
              <span className="truncate text-stone-500">Select</span>
            </>
          )}
        </div>
        
        {/* Chevron Arrow */}
        <ChevronUp size={20}/>
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
              className={`px-3 py-2.5 text-sm flex items-center gap-2.5 cursor-pointer hover:bg-stone-100 dark:hover:bg-gray-800 transition-colors ${
                selectedAssignee === null 
                  ? "text-stone-500 italic bg-stone-50 dark:bg-gray-800/50" 
                  : "text-stone-700 dark:text-gray-400"
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-stone-200 dark:bg-gray-700 flex items-center justify-center border border-stone-300 dark:border-gray-600">
                <span className="text-[11px] text-stone-500 dark:text-gray-400">?</span>
              </div>
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
                className={`px-3 py-2.5 text-sm flex items-center gap-2.5 cursor-pointer hover:bg-stone-100 dark:hover:bg-gray-800 transition-colors ${
                  selectedAssignee === member._id
                    ? "text-emerald-700 font-medium bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20"
                    : "text-stone-900 dark:text-gray-200"
                }`}
              >
                {member.avatar ? (
                  <img 
                    src={member.avatar} 
                    alt={member.username} 
                    className="w-6 h-6 rounded-full object-cover border border-stone-200 dark:border-gray-700 bg-stone-100"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                    {member.username.charAt(0).toUpperCase()}
                  </div>
                )}
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