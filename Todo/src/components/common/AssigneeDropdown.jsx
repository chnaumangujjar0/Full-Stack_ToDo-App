import { ChevronUp } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

const getInitial = (username) => (username?.trim()?.charAt(0) || "?").toUpperCase();

const AssigneeDropdown = ({
  members = [],
  selectedAssignee,
  onSelect,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const selectedMember = members.find(
    (m) => selectedAssignee != null && String(m._id) === String(selectedAssignee),
  );

  const toggleOpen = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (id) => {
    onSelect(id);
    setIsOpen(false);
  };

  return (
    <div className="relative min-w-[140px] w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleOpen}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex items-center justify-between w-full gap-2 px-3  text-base sm:text-lg text-stone-900 bg-transparent border border-stone-300 rounded-sm focus:border-stone-500 transition-colors dark:text-white dark:border-gray-700 hover:bg-stone-50 dark:hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-2.5 truncate">
          {selectedMember ? (
            <>
              {selectedMember.avatar ? (
                <img
                  src={selectedMember.avatar}
                  alt={selectedMember.username}
                  className="w-6 h-6 rounded-full object-cover border border-stone-200 dark:border-gray-700 bg-stone-100"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                  {getInitial(selectedMember.username)}
                </div>
              )}
              <span className="truncate">{selectedMember.username}</span>
            </>
          ) : (
            <span className="truncate text-stone-500">Select</span>
          )}
        </div>

        <ChevronUp
          size={20}
          className={`shrink-0 transition-transform duration-150 ${
            isOpen ? "rotate-0" : "rotate-180"
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute z-[6000] w-full mt-1 bg-white border border-stone-200 shadow-lg rounded-sm dark:bg-gray-900 dark:border-gray-700 overflow-hidden"
        >
          <ul className="py-1 max-h-48 overflow-y-auto">
            <li
              role="option"
              aria-selected={selectedAssignee == null}
              onClick={() => handleSelect(null)}
              className={`px-3 py-2.5 text-sm flex items-center gap-2.5 cursor-pointer hover:bg-stone-100 dark:hover:bg-gray-800 transition-colors ${
                selectedAssignee == null
                  ? "text-stone-500 italic bg-stone-50 dark:bg-gray-800/50"
                  : "text-stone-700 dark:text-gray-400"
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-stone-200 dark:bg-gray-700 flex items-center justify-center border border-stone-300 dark:border-gray-600">
                <span className="text-[11px] text-stone-500 dark:text-gray-400">?</span>
              </div>
              Unassigned
            </li>

            {members.length === 0 && (
              <li className="px-3 py-2.5 text-sm text-stone-400 italic">
                No members in this workspace yet
              </li>
            )}

            {members.map((member) => {
              const isSelected =
                selectedAssignee != null && String(member._id) === String(selectedAssignee);

              return (
                <li
                  key={member._id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(member._id)}
                  className={`px-3 py-2.5 text-sm flex items-center gap-2.5 cursor-pointer hover:bg-stone-100 dark:hover:bg-gray-800 transition-colors ${
                    isSelected
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
                      {getInitial(member.username)}
                    </div>
                  )}
                  <span className="truncate">{member.username}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AssigneeDropdown;