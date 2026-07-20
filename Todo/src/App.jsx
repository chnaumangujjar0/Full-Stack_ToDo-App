import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import Layout from './Layout'
import Home from './components/pages/Home'
import Detail from './components/pages/Detail'
import History from './components/pages/History'
import Login from './components/pages/Login'
import SignUp from './components/pages/SignUp'
import { Navigate, Outlet } from 'react-router';
import { useAuth } from './context/AuthContext'
function App() {
  
  
  return (
    <>
      <Routes>
          <Route path='/login' element={<Login/>} />
          <Route path='/signup' element={<SignUp/>} />
          <Route element={<ProtectedRoute/>}>
            <Route element={<Layout/>}>
              <Route path='/' element={<Home/>}/>
              <Route path='/:id' element={<Detail/>} />
              <Route path='/history' element={<History/>}/> 
            </Route>
          </Route>
        </Routes>
    </>
  )
}

export default App




export  function ProtectedRoute() {
  const { user } = useAuth(); 
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}