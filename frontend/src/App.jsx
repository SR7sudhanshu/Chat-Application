import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signin from './screens/Signin';
import Login from './screens/login';
import { UserContext,UserProvider } from './context/Context';
import Home from './screens/Home';
import Project from './screens/Project';
import 'remixicon/fonts/remixicon.css';



function App() {
  const [count, setCount] = useState(0)

  return (
    <UserProvider>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/signup' element={<Signin/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/project' element={<Project/>} />
      </Routes>
      </BrowserRouter>
    </UserProvider>
    
  )
}

export default App
