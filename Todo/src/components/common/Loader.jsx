import React from 'react'

const Loader = ({ isLoading }) => {
  if (!isLoading) return null

  return (
    <div className="absolute  inset-0 bg-stone-100/70 backdrop-blur-[1px] flex items-center justify-center z-50">
      <div className="w-10 h-10 rounded-full border-4 border-stone-300 border-t-stone-900 animate-spin" />
    </div>
  )
}

export default Loader