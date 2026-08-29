import { useState, useEffect } from 'react'
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
import Profile from './components/pages/Profile'
import ForgotPassword from './components/pages/ForgotPassword'
import Loader from './components/common/Loader'
import { useTheme } from './context/ThemeContext'
import LoginActivity from './components/pages/LoginActivity'
import WorkspaceHub from './components/pages/WorkspaceHub'
import WorkspaceDetails from './components/pages/WorkspaceDetails'
import TaskForm from './components/common/TaskForm'
function App() {
  const {loading} = useAuth()
  const {themeMode} = useTheme()
  useEffect(() => {
      document.querySelector('html').classList.remove("light","dark")
      document.querySelector('html').classList.add(themeMode)
    }, [themeMode])
  return (
    <>
      <Routes>
          <Route path='/login' element={<Login/>} />
          <Route path='/signup' element={<SignUp/>} />
          <Route path='/forgot-password' element={<ForgotPassword/>}/>
          <Route element={<ProtectedRoute/>}>
            <Route element={<Layout/>}>
              <Route path='/' element={<Home/>}/>
              <Route path='/:id' element={<Detail/>} />
              <Route path='/history' element={<History/>}/> 
              <Route path='/profile' element={<Profile/>}/>
              <Route path='/login-activity' element={<LoginActivity/>}/>
              <Route path='/workspace' element={<WorkspaceHub/>}/>
              <Route path='/workspace/:workspaceId' element={<WorkspaceDetails/>} />
              <Route element={<TaskForm/>}/>
            </Route>
          </Route>
        </Routes>
    </>
  )
}

export default App




export  function ProtectedRoute() {
  const { user,loading } = useAuth(); 
  if(loading){
    return <Loader isLoading={loading} />;
  }
  if (!user) {
    console.log("PROTECTED ROUTE REDIRECTING! User is:", user);
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}