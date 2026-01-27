import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { TimeLogProvider } from './context/TimeLogContext.jsx'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
		<TimeLogProvider>
    <App />


		</TimeLogProvider>
  </AuthProvider>,
)
