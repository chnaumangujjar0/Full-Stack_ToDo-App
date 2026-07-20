import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {useAuth} from '../../context/AuthContext'
import { logoutUser } from '../../Api/api'
import { ToastContainer,toast } from 'react-toastify'
export const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const {user} = useAuth()
  const navigate = useNavigate()
  const logout = () => {
      
      toast(
        ({ closeToast }) => (
          <div className="flex flex-col gap-3 sm:gap-4 m-3 sm:m-4 w-56 sm:w-72 bg-[#FFFDF8] rounded-sm p-4 sm:p-5">
            <p className="text-[11px] tracking-[0.2em] uppercase text-stone-400 font-mono">
              Confirm Logout
            </p>
            <p className="font-serif text-lg sm:text-xl text-stone-900 leading-snug">
              Are you want to Logout?
            </p>
            <div className="flex gap-2 justify-end mt-1">
              <button
                onClick={() => {
                  closeToast();
                }}
                className="px-4 py-1.5 rounded-sm border border-stone-300 text-stone-600 text-sm hover:border-stone-500 transition-colors"
              >
                No
              </button>
              <button
                onClick={() => {
                  logoutUser()
                  closeToast();
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
  return (
    <>
    <ToastContainer position='top-center'/>
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
            {isOpen && <Link
              to='/'
              className={`block px-3 py-2 rounded-sm hover:bg-stone-800 hover:text-white transition-colors whitespace-nowrap ${!isOpen && 'text-center px-0'}`}
            >
              Home
            </Link>}
            
          </li>
          <li>
            {isOpen && <Link to='/history'
              className={`block px-3 py-2 rounded-sm hover:bg-stone-800 hover:text-white transition-colors cursor-pointer whitespace-nowrap ${!isOpen && 'text-center px-0'}`}
            >
              History
            </Link>
            }
            
          </li>
        </ul>
      </div>
      <div className='flex flex-col align-bottom '>
          <div className='flex justify-start align-middle gap-3'>
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt="User avatar" 
              className="w-full h-full object-cover"
            />
          ) : (
            <img 
              src="./profile.svg" 
              alt="User avatar" 
              className="w-full h-full object-cover mt-1"
            />
          )}
        </div>
        {isOpen && <p className='self-center'>{user?.fullName.toUpperCase()}</p>}
          </div>
          {isOpen && <div onClick={logout} className='flex justify-center mt-2  hover:bg-stone-100/10 rounded-2xl'>
            <button className='p-3' >
              Logout
            </button>
          </div> }
          
      </div>
    </div>
    </>
  )
}

export default Header