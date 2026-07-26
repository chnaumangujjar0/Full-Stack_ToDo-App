import React from 'react'

const Loader = ({ isLoading }) => {
  if (!isLoading) return null
  
  return (
    <div className="fixed inset-0 bg-stone-100/70 backdrop-blur-[1px] flex flex-col items-center justify-center gap-10 z-50">
      <div className="w-10 h-10 rounded-full border-4 border-stone-300 border-t-stone-900 animate-spin" />
      <h1 className='text-[#045D4B]'>Loading...</h1>
    </div>
  )
}

export default Loader