import React, { useState } from 'react'
import { Link } from 'react-router'

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className={`h-full shrink-0 flex flex-col justify-between bg-emerald-900 text-stone-200 py-6 sm:py-8 transition-all duration-300 overflow-hidden ${
        isOpen ? 'absolute z-40 w-44 sm:w-56 px-4 sm:px-6 sm:relative sm:z-0 ' : 'w-12 sm:w-16 px-3'

      }`}
    >
      <div>
        <div className={`flex items-center mb-8 sm:mb-10 ${isOpen ? 'justify-between' : 'justify-center'}`}>
          {isOpen && (
            <Link to='/'>
              <h1 className='text-xl sm:text-2xl italic font-light text-white whitespace-nowrap'>
                ToDo App
              </h1>
            </Link>
          )}

          <button
            className='w-9 h-9 mt-2 shrink-0 rounded-full border border-white text-white hover:text-black hover:border-black flex items-center justify-center transition-colors'
            onClick={() => setIsOpen(!isOpen)}
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
              {isOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>

        <ul className='flex flex-col gap-1 text-sm tracking-wide'>
          <li>
            <Link
              to='/'
              className={`block px-3 py-2 rounded-sm hover:bg-stone-800 hover:text-white transition-colors whitespace-nowrap ${!isOpen && 'text-center px-0'}`}
            >
              {isOpen && 'Home' }
            </Link>
          </li>
          <li>
            <Link to='/history'
              className={`block px-3 py-2 rounded-sm hover:bg-stone-800 hover:text-white transition-colors cursor-pointer whitespace-nowrap ${!isOpen && 'text-center px-0'}`}
            >
              {isOpen && 'History'}
            </Link>
          </li>
        </ul>
      </div>
              
    </div>
  )
}

export default Header