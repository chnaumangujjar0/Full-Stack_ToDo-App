import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { getAllNotifications, readNotification } from "../../Api/api";
import { BellIcon } from "lucide-react";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    getAllNotifications()
      .then((res) => {
        setNotifications(res);
      })
      .catch((err) => console.log(err));
  }, []);

  // Close on click outside — checks both the button and the portal-rendered dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedButton = buttonRef.current && buttonRef.current.contains(event.target);
      const clickedDropdown = dropdownRef.current && dropdownRef.current.contains(event.target);
      if (!clickedButton && !clickedDropdown) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Recalculate position whenever the dropdown opens, and keep it in sync on resize/scroll
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 320; 
      const margin = 8;

      let left = rect.left + 55;
      
      if (left + dropdownWidth + margin > window.innerWidth) {
        left = window.innerWidth - dropdownWidth - margin;
      }
      // Never let it go past the left edge either
      if (left < margin) left = margin;

      setCoords({
        top: rect.bottom + margin - 80,
        left,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id, currentlyRead) => {
    if (currentlyRead) return; // Prevent unnecessary API calls if already read

    readNotification(id)
      .then(() => {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === id ? { ...notif, isRead: true } : notif
          )
        );
      })
      .catch((err) => console.log(err));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center dark:text-gray-300 dark:hover:bg-gray-800 transition-colors focus:outline-none cursor-pointer"
        aria-label="Notifications"
      >
        <BellIcon width={20} height={20}/>

        {unreadCount > 0 && (
          <span className="absolute -top-3 left-3 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[9999]"
            style={{ top: coords.top, left: coords.left }}
          >
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-800 dark:text-white flex justify-between items-center">
              <span>Notifications</span>

              {unreadCount > 0 && (
                <span className="text-xs text-blue-500 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>

            <div className="max-h-[350px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => handleMarkAsRead(notif._id, notif.isRead)}
                    className={`px-4 py-3 border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-colors ${
                      notif.isRead
                        ? "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                        : "bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        notif.isRead
                          ? "text-gray-600 dark:text-gray-400"
                          : "text-gray-900 dark:text-gray-100 font-medium"
                      }`}
                    >
                      {notif.message}
                    </p>
                    <span className="text-[11px] text-gray-400 mt-1 block">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}