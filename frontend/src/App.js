import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import AnalyzeStep1 from './pages/AnalyzeStep1';
import AnalyzeStep2 from './pages/AnalyzeStep2';
import Results from './pages/Results';
import History from './pages/History';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/analyze/step1" element={<AnalyzeStep1 />} />
          <Route path="/analyze/step2" element={<AnalyzeStep2 />} />
          <Route path="/results/:id" element={<Results />} />
          <Route path="/history" element={<History />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;