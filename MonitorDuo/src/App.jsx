import { useState } from 'react'
import './App.css'
import { Routes, Route} from "react-router-dom";
import HomePage from './Pages/HomePage';
import LoginPage from './Pages/Login';

function App() {

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
    </Routes>  
  );
}

export default App
