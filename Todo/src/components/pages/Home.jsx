import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  deleteTaskById,
  getAllTasks,
  getSingleTaskData,
  postTask,
  totalData,
  updateStatus,
  updateTaskDetails,
} from "../../Api/api.js";
import { Link } from "react-router";
import Loader from "../common/Loader.jsx";
import StatusDropdown from "../common/StatusDropdown.jsx";
import { toast, ToastContainer } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";

const Home = () => {
  const [task, setTask] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [taskStatus, setTaskStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const limit = 5;
  const titleInputRef = useRef(null);
  const [totalCount, setTotalCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [pendingCount, setpendingCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [prevButton, setPrevButton] = useState(false);
  const [dateFilter, setDateFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("none")
  useEffect(() => {
    getAllTasks(page, limit,dateFilter,statusFilter).then((res) => setTask(res));
  }, [page, limit, dateFilter,statusFilter]);

  useEffect(() => {
    totalData().then((res) => {
      setTotalCount(res[0].totalTasks || 0);
      setCompletedCount(res[0].completed) || 0;
      setpendingCount(res[0].pending || 0);
      setInProgressCount(res[0].inProgess || 0);
    });
  }, []);

  const validationSchema = Yup.object({
    title: Yup.string().trim().required("Title is required"),
    description: Yup.string().trim().required("Description is required"),
  });

  const formik = useFormik({
    initialValues: { title: "", description: "" },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      setIsLoading(true);
      try {
        await postTask(values.title, values.description, taskStatus);
        resetForm();
        setTaskStatus("pending");
        getAllTasks(page, limit, dateFilter, statusFilter).then((res) => setTask(res));

        totalData().then((res) => {
          console.log(res[0].totalTasks);
          setTotalCount(res[0].totalTasks);
          setCompletedCount(res[0].completed);
          setpendingCount(res[0].inCompleted);
        });
      } catch (error) {
        toast.error("Couldn't save task, try again.");
      } finally {
        setIsLoading(false);
      }
    },
  });

  const openEditToast = async (id) => {
    const data = await getSingleTaskData(id);
    setIsToastOpen(true);

    const handleSave = async (taskId, title, description) => {
      setIsLoading(true);
      try {
        updateTaskDetails(taskId, title, description).then(()=>{
          getAllTasks(page, limit,dateFilter,statusFilter).then((res) => setTask(res));
          toast.dismiss(toastId);
          setIsToastOpen(false);
        })
        
      } catch (err) {
        setIsLoading(false);
        throw err;
      }
      setIsLoading(false);
    };

    const handleCancel = () => {
      toast.dismiss(toastId);
      setIsToastOpen(false);
    };

    const toastId = toast(
      <EditTaskToast
        taskId={data._id}
        initialTitle={data.title}
        initialDescription={data.description}
        onSave={handleSave}
        onCancel={handleCancel}
      />,
      { autoClose: false, closeOnClick: false, closeButton: false },
    );
  };

  const confirmDelete = (id) => {
    setIsToastOpen(true);
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-3 sm:gap-4 m-3 sm:m-4 w-56 sm:w-72 bg-[#FFFDF8] rounded-sm p-4 sm:p-5 ">
          <p className="text-[11px] tracking-[0.2em] uppercase text-stone-400 font-mono ">
            Confirm delete
          </p>
          <p className="font-serif text-lg sm:text-xl text-stone-900 leading-snug">
            Delete this task?
          </p>
          <div className="flex gap-2 justify-end mt-1">
            <button
              onClick={() => {
                closeToast();
                setIsToastOpen(false);
              }}
              className="px-4 py-1.5 rounded-sm border border-stone-300 text-stone-600 text-sm hover:border-stone-500 transition-colors"
            >
              No
            </button>
            <button
              onClick={() => {
                deleteTask(id);
                closeToast();
                setIsToastOpen(false);
              }}
              className="px-4 py-1.5 rounded-sm bg-red-700 text-white text-sm hover:bg-red-800 transition-colors"
            >
              Yes
            </button>
          </div>
        </div>
      ),
      { autoClose: false, closeOnClick: false, closeButton: false },
    );
  };

  async function deleteTask(id) {
    // setIsLoading(true);
    try {
      await deleteTaskById(id);
      getAllTasks(page, limit,dateFilter,statusFilter).then((res) => setTask(res));
      totalData().then((res) => {
        console.log(res[0].totalTasks);
        setTotalCount(res[0].totalTasks);
        setCompletedCount(res[0].completed);
        setIncompletedCount(res[0].inCompleted);
      });
    } catch (err) {
      toast.error("Couldn't delete task, try again.");
    } finally {
      // setIsLoading(false);
    }
  }

  async function updateTaskStatus(id, status) {
    setUpdatingId(id);
    try {
      await updateStatus(id, status);
      getAllTasks(page, limit, dateFilter, statusFilter).then((res) => setTask(res));
      totalData().then((res) => {
        setTotalCount(res[0].totalTasks);
        setCompletedCount(res[0].completed);
        setInProgressCount(res[0].inProgess);
        setpendingCount(res[0].pending);
      });
    } catch (error) {
      toast.error("Couldn't update task status, try again.");
    } finally {
      setUpdatingId("");
    }
  }

  const cancelUpdate = () => {
    formik.resetForm();
    setIsEditing(null);
  };

  const nextpage = async () => {
    setPage(page + 1);
  };
  const prevPage = async () => {
    setPage(page - 1);
  };

  const handleDateFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  }
  return (
    <>
      <Loader isLoading={isLoading} />
      <ToastContainer position="top-center" />
      {isToastOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.05) " }}
        />
      )}
      <div className="max-w-7xl mx-auto bg-stone-100 px-3 sm:px-5 pt-6 sm:pt-10 pb-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start dark:bg-gray-800 dark:border-gray-700 dark:text-white">
        <form
          onSubmit={formik.handleSubmit}
          className="p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 w-full bg-[#FFFDF8] rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-stone-200 dark:bg-gray-900 dark:border-gray-800 dark:text-white"
        >
          <p className="text-[11px] tracking-[0.2em] uppercase text-stone-400 font-mono -mb-1">
            New Task
          </p>

          <div>
            <input
              className="h-12 sm:h-14 text-base sm:text-lg bg-transparent outline-0 text-stone-900 placeholder:text-stone-400 px-3 border border-stone-300 focus:border-stone-500 rounded-sm w-full transition-colors  dark:text-white"
              ref={titleInputRef}
              type="text"
              name="title"
              placeholder="Enter title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.title && formik.errors.title && (
              <p className="text-red-600 text-xs mt-1">{formik.errors.title}</p>
            )}
          </div>

          <div>
            <textarea
              className="min-h-24 sm:min-h-28 text-base sm:text-lg bg-transparent outline-0 text-stone-900 placeholder:text-stone-400 px-3 py-3 border border-stone-300 focus:border-stone-500 rounded-sm w-full transition-colors resize-none dark:text-white"
              name="description"
              placeholder="Enter description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.description && formik.errors.description && (
              <p className="text-red-600 text-xs mt-1">
                {formik.errors.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap justify-start gap-3 pt-1">
            <button
              type="submit"
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-sm text-emerald-50 bg-emerald-800 hover:bg-emerald-900 cursor-pointer transition-colors text-sm tracking-wide"
            >
              Add task
            </button>
            <div className="flex flex-col gap-1">
            <label className="text-[11px] tracking-[0.2em] uppercase text-stone-400 font-mono">
              Task Status
            </label>
            <StatusDropdown
              selectedStatus={taskStatus}
              onSelect={setTaskStatus}
              buttonClass="w-full justify-between "
            />
          </div>
          </div>
        </form>

        <div className="p-4 sm:p-6 lg:p-8 bg-[#FFFDF8] rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-stone-200 w-full h-full flex items-center justify-center dark:bg-gray-900 dark:border-gray-800 ">
          <div className="grid grid-cols-4  gap-2  w-full">
            <div className="aspect-square border-2 border-indigo-900 rounded-2xl bg-gray-200 text-indigo-900 shadow-2xl  sm:p-4 lg:p-6 flex flex-col justify-center items-center text-center dark:bg-gray-900 ">
              <p className="mb-0.5 sm:mb-2 text-[10px] sm:text-sm lg:text-base leading-tight">
                Total
              </p>
              <strong className="text-base sm:text-2xl lg:text-3xl">
                {totalCount}
              </strong>
            </div>
            <div className="aspect-square border-2 border-emerald-800 rounded-2xl bg-gray-200 text-emerald-800 shadow-2xl sm:p-4 lg:p-6 flex flex-col justify-center items-center text-center dark:bg-gray-900  ">
              <p className="mb-0.5 sm:mb-2 text-[10px] sm:text-sm lg:text-base leading-tight">
                Completed
              </p>
              <strong className="text-base sm:text-2xl lg:text-3xl">
                {completedCount}
              </strong>
            </div>
            <div className="aspect-square border-2 border-amber-800 rounded-2xl bg-gray-200 text-amber-800 shadow-2xl   sm:p-4 lg:p-6 flex flex-col justify-center items-center text-center dark:bg-gray-900">
              <p className="mb-0.5 sm:mb-2 text-[10px] sm:text-sm lg:text-base leading-tight">
                Pending
              </p>
              <strong className="text-base sm:text-2xl lg:text-3xl">
                {pendingCount}
              </strong>
            </div>
            <div className="aspect-square border-2 border-amber-800 rounded-2xl bg-gray-200 text-amber-800 shadow-2xl   sm:p-4 lg:p-6 flex flex-col justify-center items-center text-center dark:bg-gray-900">
              <p className="mb-0.5 sm:mb-2 text-[10px] sm:text-sm lg:text-base leading-tight">
                InProgress
              </p>
              <strong className="text-base sm:text-2xl lg:text-3xl">
                {inProgressCount}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto  px-3 py-2 sm:px-5 flex flex-col justify-between align-middle md:flex-row" >
        <h1 className="p-2 text-2xl sm:text-3xl md:text-4xl">Tasks</h1>
        <div className="flex gap-3 justify-end">
          <div className="flex flex-col">
            <label className="text-[11px] tracking-[0.2em] uppercase text-stone-400 font-mono  ">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => handleDateFilterChange(e)}
              className="h-8 px-1 sm:px-2 md:px-3 border border-stone-300 rounded-sm text-stone-900 bg-[#FFFDF8] focus:border-stone-500 transition-colors text-sm cursor-pointer dark:bg-gray-900 dark:border-gray-800 dark:text-white"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="in-progrss">In-progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[11px] tracking-[0.2em] uppercase text-stone-400 font-mono">
              Filter by date
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-8 px-1 sm:px-2 md:px-3 border border-stone-300 rounded-sm text-stone-900 bg-[#FFFDF8] focus:border-stone-500 transition-colors text-sm cursor-pointer dark:bg-gray-900 dark:border-gray-800 dark:text-white"
            >
              <option value="all">All</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
            </select>
          </div>
          
        </div>
      </div>

      <div className="max-w-7xl mx-auto bg-stone-100 mt-0 flex justify-start px-3 sm:px-5 dark:bg-gray-800 dark:border-gray-800 ">
        <ul className="pb-10 flex flex-col gap-3 sm:gap-4 w-full mx-auto bg-stone-100 dark:bg-gray-800 dark:border-gray-800 ">
          {task.length == 0 ? (
            <div className="bg-white rounded-sm shadow-sm border border-red-200 p-10 text-center text-red-500 text-sm">
              couldn't load this task. try again shortly.
            </div>
          ) : (
            task.map((obj) => {
              return (
                <li
                  key={obj._id}
                  className="relative w-full flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 bg-[#FFFDF8] rounded-sm px-3 sm:px-6 lg:px-8 py-4 sm:py-5 border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                >
                  

                  <div className="flex-1 min-w-0 basis-full sm:basis-auto order-3 sm:order-0">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <Link to={`/${obj._id}`} className="min-w-0">
                        <span className="font-serif text-base sm:text-lg text-stone-900 truncate block dark:text-white">
                          {obj.title}
                        </span>
                      </Link>
                      <span
                        className={`text-[10px] tracking-[0.15em] uppercase px-2 py-0.5 rounded-sm shrink-0 ${obj.status != "pending" ? "bg-emerald-800 text-emerald-50" : "bg-amber-600 text-amber-50"}`}
                      >
                        {obj.status == "pending" ? "Pending" : obj.status == "in-progress" ? "in-progress" : "Completed"}
                      </span>
                    </div>
                  </div>
                  <StatusDropdown
                    selectedStatus={obj.status}
                    onSelect={(status) => updateTaskStatus(obj._id, status)}
                    disabled={updatingId === obj._id}
                    buttonClass="h-8 px-3"
                  />
                  <div className="flex items-center gap-2 ml-auto sm:ml-0 z-40">
                    <button
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-stone-300 text-stone-500 hover:text-stone-800 hover:border-stone-500 flex items-center justify-center transition-colors dark:bg-gray-700 dark:border-gray-800 dark:text-white"
                      onClick={(e) => openEditToast(obj._id)}
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-stone-300 text-stone-500 hover:text-red-600 hover:border-red-300 flex items-center justify-center transition-colors dark:bg-gray-700 dark:border-gray-800 dark:text-white"
                      onClick={() => confirmDelete(obj._id)}
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
      
      <div className="py-5 flex justify-center align-middle w-full gap-3 text-white font-mono font-light ">
        <button
          className={`bg-emerald-900 text-sm px-3 py-1.5 rounded-1.5xl ${page > 1 ? "block" : "hidden"} `}
          onClick={prevPage}
        >
          Prev
        </button>
        <button
          className={`bg-emerald-900 text-sm px-3 py-1.5 rounded-1.5xl ${(totalCount / limit) > page && task.length / limit >= 1  ? "block" : "hidden"}`}
          onClick={nextpage}
        >
          {" "}
          Next{" "}
        </button>
      </div>

      <div className="flex justify-end pt-0 mb-2 px-4 absolute right-2 text-sm font-mono">
        <p>Page {page}</p>
      </div>
    </>
  );
};

export default Home;

const EditTaskToast = ({
  taskId,
  initialTitle,
  initialDescription,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleUpdate = async () => {
    if (!title.trim() || !description.trim()) {
      setError("Both fields are required");
      return;
    }
    setSaving(true);
    try {
      await onSave(taskId, title.trim(), description.trim());
    } catch (err) {
      setError("Couldn't update task, try again.");
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 m-4 w-64 sm:w-72 ">
      <p className="text-[11px] tracking-[0.2em] uppercase text-stone-400 font-mono">
        Edit task
      </p>
      <input
        className="h-11 px-3 border border-stone-300 rounded-sm text-stone-900 bg-white focus:border-stone-500 transition-colors text-sm "
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <textarea
        className="min-h-24 sm:min-h-28 border p-3 border-stone-300 rounded-sm text-stone-900 bg-white focus:border-stone-500 transition-colors text-sm resize-none "
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />
      {error && <p className="text-red-600 text-xs">{error}</p>}
      <div className="flex gap-2 justify-end mt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-1.5 rounded-sm border border-stone-300 text-stone-600 text-sm hover:border-stone-500 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={handleUpdate}
          className="px-4 py-1.5 rounded-sm bg-emerald-800 text-white text-sm hover:bg-emerald-900 transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : "Update"}
        </button>
      </div>
    </div>
  );
};
