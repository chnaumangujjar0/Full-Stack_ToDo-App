import React from "react";

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

const Pagination = ({ page, totalPages, onPrev, onNext, limit, onLimitChange }) => (
  <div className="py-5 flex flex-wrap items-center justify-center w-full gap-3 sm:gap-4 text-white font-mono font-light">
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

    {onLimitChange && (
      <div className="flex items-center gap-2">
        <label
          htmlFor="page-limit"
          className="text-[11px] tracking-[0.2em] uppercase text-stone-500"
        >
          Per page
        </label>
        <select
          id="page-limit"
          value={limit}
          onChange={(e) => onLimitChange(e.target.value)}
          className="h-8 px-2 border border-stone-300 rounded-sm text-stone-900 bg-[#FFFDF8] focus:border-stone-500 transition-colors text-sm cursor-pointer dark:bg-gray-900 dark:border-gray-800 dark:text-white"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    )}
  </div>
);

export default Pagination;