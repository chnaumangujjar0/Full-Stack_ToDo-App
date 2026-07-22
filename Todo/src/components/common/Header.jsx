import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { logoutUser } from "../../Api/api";
import { ToastContainer, toast } from "react-toastify";
export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user,setUser } = useAuth();
  const navigate = useNavigate();
  const [disableBtn, setDisableBtn] = useState(false);
  const logout = (e) => {
    setDisableBtn(true);
  
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
                setDisableBtn(false);
              }}
              className="px-4 py-1.5 rounded-sm border border-stone-300 text-stone-600 text-sm hover:border-stone-500 transition-colors"
            >
              No
            </button>
            <button
              onClick={() => {
                logoutUser();
                closeToast();
                setDisableBtn(false);
                localStorage.removeItem("accessToken")
                localStorage.removeItem("refreshToken")
                setUser(null)
                redirect();
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

  const redirect = () => {
    navigate("/login");
  };
  return (
    <>
      <ToastContainer position="top-center" />
      <div
        className={`h-full shrink-0 flex flex-col justify-between bg-emerald-900 text-stone-200 py-6 sm:py-8 transition-all duration-300 overflow-hidden ${
          isOpen
            ? "absolute z-40 w-44 sm:w-56 px-4 sm:px-6 sm:relative sm:z-0 "
            : "w-12 sm:w-16 px-3"
        }`}
      >
        <div>
          <div
            className={`flex items-center mb-8 sm:mb-10 ${isOpen ? "justify-between" : "justify-center"}`}
          >
            {isOpen && (
              <Link to="/">
                <h1 className="text-xl sm:text-2xl italic font-light text-white whitespace-nowrap">
                  ToDo App
                </h1>
              </Link>
            )}

            <button
              className="w-9 h-9 mt-2 shrink-0 rounded-full border border-white text-white hover:text-black hover:border-black flex items-center justify-center transition-colors"
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

          <ul className="flex flex-col gap-1 text-sm tracking-wide">
            <li>
              {isOpen && (
                <Link
                  to="/"
                  className={`block px-3 py-2 rounded-sm hover:bg-stone-800 hover:text-white transition-colors whitespace-nowrap ${!isOpen && "text-center px-0"}`}
                >
                  Home
                </Link>
              )}
            </li>
            <li>
              {isOpen && (
                <Link
                  to="/history"
                  className={`block px-3 py-2 rounded-sm hover:bg-stone-800 hover:text-white transition-colors cursor-pointer whitespace-nowrap ${!isOpen && "text-center px-0"}`}
                >
                  History
                </Link>
              )}
            </li>
          </ul>
        </div>

        <div className="flex flex-col align-bottom ">
          <div className="flex justify-start align-middle gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
              {user?.avatar ? (
                <Link to='/profile'>
                  <img
                    src={user.avatar}
                    alt="User avatar"
                    className="w-20 h-full  sm:h-full object-cover"
                  />
                </Link>
              ) : (
                <Link to='/profile'>
                  <img
                    src="https://images.unsplash.com/photo-1740252117044-2af197eea287?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="User avatar"
                    className="w-full h-full object-cover mt-1"
                  />
                </Link>
              )}
            </div>
            {isOpen && (
              <p className="self-center truncate">{user?.fullName.toUpperCase()}</p>
            )}
          </div>
          {isOpen && (
            <div
              className="flex justify-between mt-2  text-red-600  hover:bg-black rounded-sm "
            >
              <button className="p-2 flex gap-6 justify-between" onClick={logout} disabled={disableBtn}>
                
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>

                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Logout</span>
              </button>
              
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
