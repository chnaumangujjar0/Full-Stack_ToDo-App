import { getAllInvites, respondToInvite } from "@/Api/api";
import { UserRoundPlus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
// import { getPendingInvites, respondToInvite } from "../../Api/api";

export default function InviteDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [invites, setInvites] = useState([]);
  
  // We need TWO refs now: one for the button, one for the teleported menu
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  
  // State to hold the exact screen coordinates for the portal
  const [coords, setCoords] = useState({ left: 0, top: 0 });

  // 1. Fetch pending invites on load
  useEffect(() => {
    getAllInvites()
    .then((res) => {
        setInvites(res)
    } )
    .catch((err) => console.log(err))
  }, []);

  // 2. Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Because the menu is portaled to the body, we must check BOTH refs
      if (
        buttonRef.current && !buttonRef.current.contains(event.target) &&
        (!menuRef.current || !menuRef.current.contains(event.target))
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. Handle Accept / Decline Action
  const handleResponse = async (inviteId, action) => {
      respondToInvite(action,inviteId)
      .then(() => {
          toast.success(`Invite ${action} successfully!`);
          setInvites((prev) => prev.filter((inv) => inv._id !== inviteId));
          if (invites.length === 1) setIsOpen(false);
      }).catch((error) => {
          console.error(error);
          toast.error(`Failed to ${action} invite.`);
      })
    
    
  };

  // 4. Calculate Coordinates before opening
  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      
      // Replicating your original Tailwind classes: left-16 (64px) and -top-20 (-80px)
      setCoords({
        left: rect.left + 35 + window.scrollX,
        top: rect.top - 80 + window.scrollY, 
      });
    }
    setIsOpen(!isOpen);
  };

  const pendingCount = invites.length;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="relative flex items-center transition-colors focus:outline-none cursor-pointer"
        aria-label="Invitations"
      >
        <UserRoundPlus size={20}/>
        {pendingCount > 0 && (
          <span className="absolute -top-3 left-3 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-blue-500 rounded-full">
            {pendingCount}
          </span>
        )}
      </button>

      {/* 
        PORTAL LOGIC: 
        If isOpen is true, render this div directly into document.body 
      */}
      {isOpen && createPortal(
        <div 
          ref={menuRef}
          style={{ 
            top: `${coords.top}px`, 
            left: `${coords.left}px` 
          }}
          className="absolute w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[9999]"
        >
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-800 dark:text-white flex justify-between items-center">
            <span>Workspace Invites</span>
            {pendingCount > 0 && (
              <span className="text-xs text-blue-500 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                {pendingCount} Pending
              </span>
            )}
          </div>

          <div className="max-h-[350px] overflow-y-auto">
            {pendingCount === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                No pending invites.
              </div>
            ) : (
              invites.map((invite) => (
                <div
                  key={invite._id}
                  className="px-4 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
                >
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed mb-3">
                    <span className="font-semibold text-gray-900 dark:text-white">@{invite.inviter.username}</span> invited you to join {" "}
                    <span className="font-semibold text-stone-900 dark:text-white bg-stone-100 dark:bg-gray-800 px-1 rounded">
                      {invite.workspace.name}
                    </span>
                  </p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResponse(invite._id, "accepted")}
                      className="flex-1 py-1.5 text-xs font-medium text-emerald-50 bg-emerald-700 hover:bg-emerald-800 rounded transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleResponse(invite._id, "declined")}
                      className="flex-1 py-1.5 text-xs font-medium text-stone-600 dark:text-gray-300 bg-stone-100 dark:bg-gray-800 hover:bg-stone-200 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>,
        document.body 
      )}
    </>
  );
}