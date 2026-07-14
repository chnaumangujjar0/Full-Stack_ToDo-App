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


function App() {
  
  
  return (
    <>
      <BrowserRouter>
      <Routes>
          <Route element={<Layout/>}>
            <Route path='/' element={<Home/>}/>
            <Route path='/:id' element={<Detail/>} />
            <Route path='/history' element={<History/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
