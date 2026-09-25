import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './Pages/HomePage'
import LoginPage from './Pages/Login'
import AlertsPage from './Pages/AlertsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/alerts" element={<AlertsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
