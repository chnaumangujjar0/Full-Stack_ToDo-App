import React,{useEffect} from "react";
import { useTheme } from "../../context/ThemeContext";

export const Footer = () => {

  const {themeMode, setThemeMode} = useTheme()

  

const handleToggleTheme = () =>{
  if(themeMode == "light"){
    setThemeMode("dark")
  }else{
    setThemeMode("light")
  }
}
  return (
    <footer className=" bg-emerald-900  shadow-xs border-0 px-3 dark:bg-gray-800 dark:border-gray-700">
      <div className="w-full mx-auto max-w-screen-7xl py-4 px-2 flex justify-between md:flex md:items-center md:justify-between text-white">
        <span>
          © 2026 <a className="hover:underline">ToDo App</a>. All Rights
          Reserved.
        </span>
        <div>
          {themeMode == "light" ? (
            <button onClick={handleToggleTheme}>
              <svg
                class="theme-icon sun-icon"
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
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2"></path>
                <path d="M12 20v2"></path>
                <path d="m4.93 4.93 1.41 1.41"></path>
                <path d="m17.66 17.66 1.41 1.41"></path>
                <path d="M2 12h2"></path>
                <path d="M20 12h2"></path>
                <path d="m6.34 17.66-1.41 1.41"></path>
                <path d="m19.07 4.93-1.41 1.41"></path>
              </svg>
            </button>

          ): (
          <button onClick={handleToggleTheme}>
            <svg
              class="theme-icon moon-icon"
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
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
            </svg>
          </button>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
