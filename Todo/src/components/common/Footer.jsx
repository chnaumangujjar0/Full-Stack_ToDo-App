import React from "react";

export const Footer = () => {
  return (
    <footer className=" bg-emerald-900  shadow-xs border-0">
      <div className="w-full mx-auto max-w-screen-7xl py-4 px-2 md:flex md:items-center md:justify-between text-white">
        <span >
           © 2026{" "}
          <a className="hover:underline">
            ToDo App
          </a>
          . All Rights Reserved.
        </span>
        
      </div>
    </footer>
  );
};

export default Footer;
