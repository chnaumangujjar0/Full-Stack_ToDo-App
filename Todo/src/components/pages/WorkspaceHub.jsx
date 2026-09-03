import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { MoreVertical, Trash2, Pencil, Share2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import CreateWorkspaceModal from "../common/CreateWorkspaceModal";
import InviteMemberModal from "../common/InviteMemberModal";
import UpdateWorkspaceModal from "../common/UpdateWorkSpaceModal";
import DeleteConfirmToast from "../common/DeleteConfirmToast.jsx";
import Loader from "../common/Loader.jsx";
import { getAllWorkspaces, deleteWorkspaceById } from "@/Api/api";
import { useAuth } from "@/context/AuthContext";
import { socket } from "@/socket";
const ROLE_BADGE_STYLES = {
  owner: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  member: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

const formatDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const WorkspaceHub = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [shareTarget, setShareTarget] = useState(null);
  const [updateTarget, setUpdateTarget] = useState(null);

  const { user } = useAuth();

  const fetchWorkspaces = async () => {
    setIsLoading(true);
    try {
      const res = await getAllWorkspaces();
      setWorkspaces(Array.isArray(res) ? res : []);
    } catch (err) {
      toast.error("Couldn't load workspaces, try again.");
      setWorkspaces([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();

  }, []);
  useEffect(() => {
    const handleWorkspaceJoined = (newWorkspace) => {
      setWorkspaces((prev) => {
        const isDuplicate = prev.some((ws) => ws._id === newWorkspace._id);
        if (isDuplicate) return prev;
        return [newWorkspace, ...prev];
      });
    };
 
    socket.on("workspace_joined", handleWorkspaceJoined);
    return () => socket.off("workspace_joined", handleWorkspaceJoined);
  }, []);
  const handleDelete = (workspace) => {
    toast(
      ({ closeToast }) => (
        <DeleteConfirmToast
          closeToast={closeToast}
          onConfirm={async () => {
            try {
              await deleteWorkspaceById(workspace._id);
              toast.success("Workspace deleted.");
              await fetchWorkspaces();
            } catch (err) {
              toast.error("Couldn't delete workspace, try again.");
            }
          }}
        />
      ),
      { autoClose: false, closeOnClick: false, closeButton: false },
    );
  };

  return (
    <>
      <ToastContainer position="top-right" />

      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchWorkspaces}
      />

      <InviteMemberModal
        isOpen={Boolean(shareTarget)}
        onClose={() => setShareTarget(null)}
        workspaceId={shareTarget?._id}
        workspaceName={shareTarget?.name}
      />

      <UpdateWorkspaceModal
        isOpen={Boolean(updateTarget)}
        onClose={() => setUpdateTarget(null)}
        workspaceId={updateTarget?._id}
        initialName={updateTarget?.name}
        onSuccess={fetchWorkspaces}
      />

      <Loader isLoading={isLoading} />

      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Workspaces
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your teams and shared projects.
            </p>
          </div>
          <button
            className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-emerald-50 text-sm font-medium rounded-sm transition-colors shadow-sm"
            onClick={() => setIsCreateModalOpen(true)}
          >
            + Create Workspace
          </button>
        </div>

        {/* Grid Section */}
        {!isLoading && workspaces.length === 0 ? (
          <div className="text-center py-12 bg-[#FFFDF8] border border-stone-200 dark:bg-gray-900 dark:border-gray-800 rounded-sm">
            <p className="text-stone-500 dark:text-gray-400">
              You haven't joined any workspaces yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {workspaces.map((workspace) => {
              const isOwner = workspace.owner === user._id;
              const isAdmin = workspace.role === "admin";
              const canManage = isOwner || isAdmin;
              const canDelete = isOwner;

              const badgeStyle = ROLE_BADGE_STYLES[workspace.role] ?? ROLE_BADGE_STYLES.member;

              const dateLabel = isOwner
                ? formatDate(workspace.createdAt) && `Created ${formatDate(workspace.createdAt)}`
                : formatDate(workspace.joinedAt) && `Joined ${formatDate(workspace.joinedAt)}`;

              return (
                <Link
                  to={`/workspace/${workspace._id}`}
                  key={workspace._id}
                  className="group relative flex flex-col justify-between p-5 bg-[#FFFDF8] dark:bg-gray-900 border border-stone-200 dark:border-gray-800 rounded-sm shadow-sm hover:shadow-md hover:border-emerald-500/50 dark:hover:border-emerald-500/50 cursor-pointer transition-all h-40"
                >
                  <div className="flex justify-between items-start gap-2">
                    <h2 className="text-lg font-semibold text-stone-900 dark:text-white truncate pr-2">
                      {workspace.name}
                    </h2>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${badgeStyle}`}
                      >
                        {workspace.role}
                      </span>

                      {canManage && (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <button
                                type="button"
                                aria-label="Workspace actions"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                className="p-1 rounded-sm text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
                              >
                                <MoreVertical size={16} />
                              </button>
                            }
                          />

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setShareTarget(workspace);
                              }}
                            >
                              <Share2 size={14} className="mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setUpdateTarget(workspace);
                              }}
                            >
                              <Pencil size={14} className="mr-2" />
                              Rename
                            </DropdownMenuItem>
                            {canDelete && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(workspace);
                                  }}
                                >
                                  <Trash2 size={14} className="mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-end mt-4">
                    <div className="text-sm text-stone-500 dark:text-gray-400 font-medium">
                      {dateLabel || "\u00A0"}
                    </div>
                    <div className="text-stone-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default WorkspaceHub;