import React from 'react'
import Header from './components/common/Header'
import { Outlet } from 'react-router'
import Footer from './components/common/Footer'

const Layout = () => {
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <div className="flex flex-1 min-h-0">
        <Header />
        <div className="flex-1 overflow-y-auto min-h-0">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Layout