import React, { useState, useRef, useEffect } from "react";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const StatusDropdown = ({
  selectedStatus = "pending",
  onSelect,
  disabled = false,
  buttonText,
  buttonClass = "",
  menuClass = "",
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const label = buttonText
    ? buttonText
    : STATUS_OPTIONS.find((option) => option.value === selectedStatus)?.label || "Status";

  const handleToggle = () => {
    if (!disabled) {
      setOpen((prev) => !prev);
    }
  };

  const handleSelect = (status) => {
    setOpen(false);
    onSelect(status);
  };

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-sm border border-stone-300 bg-white text-stone-900 transition-colors ${buttonClass} ${disabled ? "opacity-60 cursor-not-allowed" : "hover:border-stone-500"}`}
      >
        <span>{label}</span>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-150"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className={`absolute right-0 top-full mt-2 w-40 rounded-sm border border-stone-200 bg-white shadow-lg z-50 ${menuClass}`}>
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-3 py-2 text-sm ${selectedStatus === option.value ? "bg-stone-100 font-semibold" : "hover:bg-stone-50"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;
