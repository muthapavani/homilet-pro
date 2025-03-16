import React from "react"
import { BrowserRouter,Routes,Route } from "react-router-dom"
import Landing from "./pages/ladigpage.jsx"
import Signuplogin from "./pages/login_signup"
import Login from "./loginsignup/login"



function App() {
 
  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Landing></Landing>}/>  
      {/* <Route path="/login" element={<Login/>} /> */}
      <Route path="/*" element={<Signuplogin ></Signuplogin>}/>
     </Routes>
     </BrowserRouter>
    </>
  )
}

export default App