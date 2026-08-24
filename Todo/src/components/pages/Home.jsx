import React, { useState, useEffect, useCallback } from "react";
import {
  deleteTaskById,
  getAllTasks,
  getSingleTaskData,
  totalData,
  updateStatus,
  updateTaskDetails,
} from "../../Api/api.js";
import Loader from "../common/Loader.jsx";
import { toast, ToastContainer } from "react-toastify";

import { LIMIT } from "../common/constants.js";
import TaskForm from "../common/TaskForm.jsx";
import StatsPanel from "../common/StatsPanel.jsx";
import TaskFilters from "../common/TaskFilters.jsx";
import TaskList from "../common/TaskList.jsx";
import Pagination from "../common/Pagination.jsx";
import EditTaskToast from "../common/EditTaskToast.jsx";
import DeleteConfirmToast from "../common/DeleteConfirmToast.jsx";
import { socket } from "@/socket.js";

const Home = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [taskStatus, setTaskStatus] = useState("pending");
  const [deadline, setDeadline] = useState(new Date());
  const [page, setPage] = useState(1);
  const [limit,setLimit] = useState(5)
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
  });

  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const totalPages = Math.max(1, Math.ceil(stats.total / limit));

  // ---- Data fetching -------------------------------------------------

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAllTasks(page, limit, dateFilter, statusFilter);
      setTasks(Array.isArray(res) ? res : []);
    } catch (err) {
      toast.error("Couldn't load tasks, try again.");
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, dateFilter, statusFilter, limit]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await totalData();
      const summary = res?.[0];
      if (!summary) return;
      console.log(summary)
      setStats({
        total: summary.totalTasks || 0,
        completed: summary.completed || 0,
        pending: summary.pending || 0,
        inProgress: summary.inProgress || 0,
      });
    } catch (err) {
      // Stats are secondary information; fail silently but keep last known values.
      console.error("Failed to load task stats", err);
    }
  }, []);

  useEffect(() => {
    

    function onConnect() {
      console.log("🟢 Connected to Socket.io server with ID:", socket.id);
    }

    function onDisconnect() {
      console.log("🔴 Disconnected from Socket.io server");
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    console.log("🚀 Frontend Alert: Attempting to connect to Socket.io...");
    if (!socket.connected) {
      socket.connect();
    }
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      // socket.disconnect(); 
    };
  },[])
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refreshAll = () => Promise.all([fetchTasks(), fetchStats()]);

  // ---- Edit task ---------------------------------------------------------

  const openEditToast = async (id) => {
    setIsLoading(true);
    let data;
    try {
      data = await getSingleTaskData(id);
    } catch (err) {
      toast.error("Couldn't load task details.");
      return;
    } finally {
      setIsLoading(false);
    }

    setIsToastOpen(true);

    const handleSave = async (taskId, title, description, deadline) => {
      await updateTaskDetails(taskId, title, description, deadline);
      await fetchTasks();
      toast.dismiss(toastId);
      setIsToastOpen(false);
    };

    const handleCancel = () => {
      toast.dismiss(toastId);
      setIsToastOpen(false);
    };

    const toastId = toast(
      <EditTaskToast
        taskId={data._id}
        initialTitle={data.title}
        initialDeadline={data.deadline ? new Date(data.deadline) : new Date()}
        initialDescription={data.description}
        onSave={handleSave}
        onCancel={handleCancel}
      />,
      { autoClose: false, closeOnClick: false, closeButton: false },
    );
  };

  // ---- Delete task ---------------------------------------------------------

  const deleteTask = async (id) => {
    setIsLoading(true);
    try {
      await deleteTaskById(id);
      await refreshAll();
    } catch (err) {
      toast.error("Couldn't delete task, try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (id) => {
    setIsToastOpen(true);
    toast(
      ({ closeToast }) => (
        <DeleteConfirmToast
          closeToast={() => {
            closeToast();
            setIsToastOpen(false);
          }}
          onConfirm={() => deleteTask(id)}
        />
      ),
      { autoClose: false, closeOnClick: false, closeButton: false },
    );
  };

  // ---- Status update ---------------------------------------------------------

  const updateTaskStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await updateStatus(id, status);
      await refreshAll();
    } catch (error) {
      toast.error("Couldn't update task status, try again.");
    } finally {
      setUpdatingId("");
    }
  };

  // ---- Filters & pagination ---------------------------------------------------------

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
    setPage(1);
  };

  const goToNextPage = () => setPage((p) => Math.min(p + 1, totalPages));
  const goToPrevPage = () => setPage((p) => Math.max(p - 1, 1));
  const onLimitChange = (value) => setLimit(value)
  return (
    <>
      <Loader isLoading={isLoading} />
      <ToastContainer position="top-center" />
      {isToastOpen && (
        <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.05)" }} />
      )}

      <div className="max-w-7xl mx-auto bg-stone-100 px-3 sm:px-5 pt-6 sm:pt-10 pb-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start dark:bg-gray-800 dark:border-gray-700 dark:text-white">
        <TaskForm
          taskStatus={taskStatus}
          setTaskStatus={setTaskStatus}
          deadline={deadline}
          setDeadline={setDeadline}
          setIsLoading={setIsLoading}
          onTaskAdded={refreshAll}
        />
        <StatsPanel stats={stats} />
      </div>

      <TaskFilters
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        dateFilter={dateFilter}
        onDateFilterChange={handleDateFilterChange}
      />

      <TaskList
        tasks={tasks}
        isLoading={isLoading}
        updatingId={updatingId}
        onStatusChange={updateTaskStatus}
        onEdit={openEditToast}
        onDelete={confirmDelete}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        onPrev={goToPrevPage}
        onNext={goToNextPage}
        limit={limit}
        onLimitChange={onLimitChange}
      />
    </>
  );
};

export default Home;