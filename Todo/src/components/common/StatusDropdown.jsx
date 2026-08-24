import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";

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
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const label = buttonText
    ? buttonText
    : STATUS_OPTIONS.find((option) => option.value === selectedStatus)?.label || "Status";

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMenuStyle({
      top: rect.bottom + 8,
      left: rect.left,
      width: Math.max(rect.width, 160),
    });
  }, []);

  // Position the menu right before it paints, so it doesn't flash at (0,0).
  useLayoutEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

  // Close on outside click (checks both the trigger button and the portaled menu).
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Keep the menu glued to the button on scroll/resize while open.
  useEffect(() => {
    if (!open) return;

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

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
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`flex items-center align-middle gap-2 px-3 py-1 text-sm rounded-sm border border-stone-300 bg-white text-stone-900 transition-colors ${buttonClass} ${disabled ? "opacity-60 cursor-not-allowed" : "hover:border-stone-500"} dark:bg-gray-700 dark:border-gray-800 dark:text-white`}
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

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: menuStyle.top,
              left: menuStyle.left,
              width: menuStyle.width,
            }}
            className={`rounded-sm border border-stone-200 bg-white shadow-lg z-[10000] ${menuClass} dark:bg-gray-700 dark:border-gray-800 dark:text-white`}
          >
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left px-3 py-2 text-sm ${selectedStatus === option.value ? "bg-stone-100 font-semibold" : "hover:bg-stone-50"} dark:text-black`}
              >
                {option.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default StatusDropdown;