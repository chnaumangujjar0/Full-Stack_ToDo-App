import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { getSingleTaskData } from '../../Api/api'

const Detail = () => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("loading") 
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    setStatus("loading")
    getSingleTaskData(id)
      .then((res) => {
        setTitle(res.title)
        setDescription(res.description)
        setStatus("ready")
      })
      .catch(() => setStatus("error"))
  }, [])

  return (
    <div className="min-h-screen bg-stone-100 flex justify-center  px-4 py-5 scrollbar-none dark:bg-gray-700 dark:border-gray-700 ">
      <div className="w-full max-w-lg">
        <button
          onClick={() => navigate(-1)}
          className="mb-5 text-sm text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-1"
        >
          <span aria-hidden="true">←</span> back to tasks
        </button>

        {status === "loading" && (
          <div className="bg-white rounded-sm shadow-sm border border-stone-200 p-10 text-center text-stone-400 text-sm tracking-wide dark:bg-gray-700 dark">
            fetching task…
          </div>
        )}

        {status === "error" && (
          <div className="bg-white rounded-sm shadow-sm border border-red-200 p-10 text-center text-red-500 text-sm">
            couldn't load this task. try again shortly.
          </div>
        )}

        {status === "ready" && (
          <div className="relative bg-[#FFFDF8] rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-stone-200 overflow-hidden">
            <div className="px-8 py-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] tracking-[0.2em] uppercase text-stone-400 font-mono">
                  Task No. {String(id).padStart(4, '0')}
                </span>
              </div>
              <h1 className="font-serif text-3xl leading-snug text-stone-900">
                {title}
              </h1>
            </div>

            <div className="relative flex items-center px-2">
              <div className="absolute -left-3 w-6 h-6 rounded-full bg-stone-100 border border-stone-200" />
              <div className="flex-1 border-t border-dashed border-stone-300" />
              <div className="absolute -right-3 w-6 h-6 rounded-full bg-stone-100 border border-stone-200" />
            </div>

            <div className="px-8 pt-6 pb-8">
              <p className="text-[11px] tracking-[0.2em] uppercase text-stone-400 font-mono mb-2">
                Description
              </p>
              <p className="text-base leading-relaxed text-stone-700 wrap-anywhere ">
                {description}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Detail