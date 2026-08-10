import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PayrollProvider } from './PayrollContext'
import { AppLayout } from './layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { DevelopersPage } from './pages/DevelopersPage'
import { TasksPage } from './pages/TasksPage'
import { CommitsPage } from './pages/CommitsPage'
import { ExcludedPage } from './pages/ExcludedPage'
import './App.css'

export default function App() {
  return (
    <PayrollProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="developers" element={<DevelopersPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="commits" element={<CommitsPage />} />
            <Route path="excluded" element={<ExcludedPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PayrollProvider>
  )
}
