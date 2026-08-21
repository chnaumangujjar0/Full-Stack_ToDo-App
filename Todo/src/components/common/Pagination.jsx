import React from "react";

const Pagination = ({ page, totalPages, onPrev, onNext }) => (
  <div className="py-5 flex items-center justify-center w-full gap-3 text-white font-mono font-light">
    <button
      type="button"
      className="bg-emerald-900 text-sm px-3 py-1.5 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
      onClick={onPrev}
      disabled={page <= 1}
    >
      Prev
    </button>
    <span className="text-stone-700 text-sm">
      Page {page} of {totalPages}
    </span>
    <button
      type="button"
      className="bg-emerald-900 text-sm px-3 py-1.5 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
      onClick={onNext}
      disabled={page >= totalPages}
    >
      Next
    </button>
  </div>
);

export default Pagination;