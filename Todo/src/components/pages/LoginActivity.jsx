import { getLoginActivity } from "@/Api/api";
import { useState, useEffect } from "react";

export default function LoginActivity() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
        getLoginActivity(page)
        .then((res) => setHistory(res))
        .catch((err) => console.log(err))
        .finally(
            setIsLoading(false)
        )
    };

    fetchHistory();
  }, [page]);

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="w-full  max-w-4xl mt-20 mx-auto p-4 md:p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Login History
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Review your recent account access across devices.
        </p>
      </div>

      <div className="flex-grow">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="pb-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Date & Time
                  </th>
                  <th className="pb-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Device
                  </th>
                  <th className="pb-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    IP Address
                  </th>
                  <th className="pb-3  xext-sm font-semibold text-gray-600 dark:text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {history.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-6 text-center text-sm text-gray-500"
                    >
                      No login history found.
                    </td>
                  </tr>
                ) : (
                  history.map((session) => (
                    <tr
                      key={session._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="py-4 px-2 text-sm text-gray-900 dark:text-gray-200 whitespace-nowrap">
                        {formatDate(session.createdAt)}
                      </td>
                      <td className="py-4 px-2 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {session.deviceInfo}
                      </td>
                      <td className="py-4 px-2 text-sm font-mono text-gray-500 dark:text-gray-400 whitespace-wrap">
                        {session.ipAddress}
                      </td>
                      <td className="py-4 px-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            session.status === "success"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {session.status.charAt(0).toUpperCase() +
                            session.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 mt-4 border-t border-gray-200 dark:border-gray-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              {page}
            </span>{" "}
            of{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              {totalPages}
            </span>
          </span>

          <div className="flex space-x-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
