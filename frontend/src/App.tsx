import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './store/authStore';
import { LangProvider } from './store/langStore';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import StageDetailPage from './pages/StageDetailPage';
import Header from './components/Header';
import NotificationsPage from './pages/NotificationsPage';
import AdminPage from './pages/AdminPage';
import VerifyEmailPage from './pages/VerifyEmailPage';

function App() {
  return (
    <LangProvider>
    <AuthProvider>
      <BrowserRouter>
        <Header />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
            <Route path="/" element={<div>Home</div>} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
            <Route path="/projects/:projectId/stages/:stageId" element={<ProtectedRoute><StageDetailPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
          </Routes>
      </BrowserRouter>
    </AuthProvider>
    </LangProvider>
  )
}

export default App
