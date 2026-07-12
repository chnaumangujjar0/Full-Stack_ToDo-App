import React, { useState, useEffect,useRef } from "react";
import axios from "axios";
import {
  deleteTaskById,
  getAllTasks,
  getSingleTaskData,
  postTask,
  updateStatus,
  updateTaskDetails,
} from "../../Api/api.js";
import { Link } from "react-router";
import Loader from "../common/Loader.jsx";
import { toast, ToastContainer } from "react-toastify";
const Home = () => {
  const [task, setTask] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [id, setId] = useState("");
  const [isEditing, setIsEditing] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false)
  const [updatingId,setUpdatingId] = useState("")
  const completedCount = task.filter((t) => t.completed).length;
  const titleInputRef = useRef(null);
  useEffect(() => {
     getAllTasks().then((res) => setTask(res))
  }, []);
  
  async function addTask() {
    if (!title || !description) {
      alert("please add title and description");
      return;
    }
      setIsLoading(true)
      try {
        if (isEditing) {
          await updateTaskDetails(id, title, description);
        } else {
          setIsLoading(true);
          await postTask(title,description)
        }
        setTitle("");
        setDescription("");
        setIsEditing(null);
        await getAllTasks().then((res) => setTask(res));
      } catch (error) {
        toast.error("Couldn't save task, try again.")
      }finally{
        setIsLoading(false);
      }
  }

  const updateDetails = async (id) => {
    const data = await getSingleTaskData(id);

    setTitle(data.title);
    setDescription(data.description);
    setId(data._id);
    setIsEditing(true);
    titleInputRef.current.focus();
  };

  const confirmDelete = (id) => {
    setIsConfirming(true)
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-3 m-5 ">
          <p className="text-2xl text-stone-800">Delete this task?</p>
          <div className="flex gap-2 justify-end mt-3">
            <button
              onClick={() => {
                closeToast();
                setIsConfirming(false)
              }} 
              className="w-25 px-5 py-1.5 rounded-sm border border-stone-300 text-stone-600 text-sm hover:border-stone-500 transition-colors"
            >
              No
            </button>
            <button
              onClick={() => {
                deleteTask(id);
                closeToast();
                setIsConfirming(false)
              }}
              className=" w-25 px-5 py-1.5 rounded-sm bg-red-600 text-white text-sm hover:bg-red-700 transition-colors"
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
    setIsLoading(true);
  try {
    await deleteTaskById(id);
    getAllTasks().then((res) => setTask(res))
  } catch (err) {
    toast.error("Couldn't delete task, try again.");
  } finally {
    setIsLoading(false);
  }
  }

  async function updateTaskStatus(id) {
    setUpdatingId(id)
    try {
      await updateStatus(id)
      await getAllTasks().then((res) => setTask(res))
    } catch (error) {
      toast.error("Couldn't update task Status, try again.");
    }finally{
      setUpdatingId("")
    }
  }

  const cancelUpdate = () => {
    setTitle("");
    setDescription("");
    setIsEditing(null);
  };

  return (
    <div className=" bg-stone-100">
      <Loader isLoading={isLoading} />
      <ToastContainer position="top-center" />
      {isConfirming && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.05)" }}
        />
      )}
      <div className="max-w-7xl mx-auto bg-stone-100 px-3 sm:px-5 pt-6 sm:pt-10 pb-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
        <div className="p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 w-full bg-[#FFFDF8] rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-stone-200">
          <p className="text-[11px] tracking-[0.2em] uppercase text-stone-400 font-mono -mb-1">
            {isEditing ? "Edit task" : "New task"}
          </p>
          <input
            className="h-12 sm:h-14 text-base sm:text-lg bg-transparent outline-0 text-stone-900 placeholder:text-stone-400 px-3 border border-stone-300 focus:border-stone-500 rounded-sm w-full transition-colors"
            type="text"
            placeholder="Enter title"
            value={title}
            ref={titleInputRef}
            onChange={(e) => setTitle(e.target.value)}
          ></input>
          <input
            className="h-12 sm:h-14 text-base sm:text-lg bg-transparent outline-0 text-stone-900 placeholder:text-stone-400 px-3 border border-stone-300 focus:border-stone-500 rounded-sm w-full transition-colors"
            type="text"
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></input>
          <div className="flex flex-wrap justify-start gap-3 pt-1">
            <button
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-sm text-emerald-50 bg-emerald-800 hover:bg-emerald-900 cursor-pointer transition-colors text-sm tracking-wide"
              onClick={() => addTask()}
            >
              {isEditing ? "Update" : "Add task"}
            </button>
            {isEditing && (
              <button
                className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-sm text-stone-600 border border-stone-300 hover:border-stone-500 cursor-pointer transition-colors text-sm tracking-wide `}
                onClick={() => cancelUpdate()}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 bg-[#FFFDF8] rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-stone-200 w-full h-full">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 h-full">
            <div className="aspect-square border-2 border-indigo-900 rounded-2xl bg-gray-200 text-indigo-900 shadow-2xl p-2 sm:p-4 lg:p-6 flex flex-col justify-center items-center text-center">
              <p className="mb-0.5 sm:mb-2 text-[10px] sm:text-sm lg:text-base leading-tight">Total</p>
              <strong className="text-base sm:text-2xl lg:text-3xl">{task.length}</strong>
            </div>
            <div className="aspect-square border-2 border-emerald-800 rounded-2xl bg-gray-200 text-emerald-800 shadow-2xl p-2 sm:p-4 lg:p-6 flex flex-col justify-center items-center text-center">
              <p className="mb-0.5 sm:mb-2 text-[10px] sm:text-sm lg:text-base leading-tight">Completed</p>
              <strong className="text-base sm:text-2xl lg:text-3xl">{completedCount}</strong>
            </div>
            <div className="aspect-square border-2 border-amber-800 rounded-2xl bg-gray-200 text-amber-800 shadow-2xl p-2 sm:p-4 lg:p-6 flex flex-col justify-center items-center text-center">
              <p className="mb-0.5 sm:mb-2 text-[10px] sm:text-sm lg:text-base leading-tight">InCompleted</p>
              <strong className="text-base sm:text-2xl lg:text-3xl">
                {task.length - completedCount}
              </strong>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto bg-stone-100 mt-0 flex justify-start px-3 sm:px-5 ">
        <ul className="pb-10 flex flex-col gap-3 sm:gap-4 w-full mx-auto bg-stone-100 ">
          {task.map((obj) => {
            return (
              <li
                key={obj._id}
                className="relative w-full flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 bg-[#FFFDF8] rounded-sm px-3 sm:px-6 lg:px-8 py-4 sm:py-5 border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden"
              >
                <button
                disabled={updatingId === obj._id}
                  className={`relative w-6 h-6 shrink-0 rounded-full border-2 border-stone-400 ${obj.completed ? "bg-stone-900 border-stone-900" : "bg-transparent"} flex items-center justify-center`}
                  onClick={(e) => updateTaskStatus(obj._id)}
                >
                  {updatingId === obj._id && (
                    <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap px-3 py-1 rounded-2xl bg-emerald-900 text-amber-50 text-xs" >Saving...</span>
                  )}
                </button>

                <div className="flex-1 min-w-0 basis-full sm:basis-auto order-3 sm:order-none">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <Link to={`/${obj._id}`} className="min-w-0">
                      <span className="font-serif text-base sm:text-lg text-stone-900 truncate block">
                        {obj.title}
                      </span>
                    </Link>
                    <span
                      className={`text-[10px] tracking-[0.15em] uppercase px-2 py-0.5 rounded-sm shrink-0 ${obj.completed ? "bg-emerald-800 text-emerald-50" : "bg-amber-600 text-amber-50"}`}
                    >
                      {obj.completed ? "Completed" : "Incomplete"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto sm:ml-0">
                  <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-stone-300 text-stone-500 hover:text-stone-800 hover:border-stone-500 flex items-center justify-center transition-colors"
                  onClick={(e) => updateDetails(obj._id)}
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
                  <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-stone-300 text-stone-500 hover:text-red-600 hover:border-red-300 flex items-center justify-center transition-colors"
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
          })}
        </ul>
      </div>
    </div>
  );
};

export default Home;