import React from "react";

const DeleteConfirmToast = ({ closeToast, onConfirm }) => (
  <div className="flex flex-col gap-3 sm:gap-4 m-3 sm:m-4 w-56 sm:w-72 bg-[#FFFDF8] rounded-sm p-4 sm:p-5">
    <p className="text-[11px] tracking-[0.2em] uppercase text-stone-400 font-mono">
      Confirm delete
    </p>
    <p className="font-serif text-lg sm:text-xl text-stone-900 leading-snug">Delete this task?</p>
    <div className="flex gap-2 justify-end mt-1">
      <button
        onClick={closeToast}
        className="px-4 py-1.5 rounded-sm border border-stone-300 text-stone-600 text-sm hover:border-stone-500 transition-colors"
      >
        No
      </button>
      <button
        onClick={() => {
          closeToast();
          onConfirm();
        }}
        className="px-4 py-1.5 rounded-sm bg-red-700 text-white text-sm hover:bg-red-800 transition-colors"
      >
        Yes
      </button>
    </div>
  </div>
);

export default DeleteConfirmToast;