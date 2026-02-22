import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import SecureDownload from './pages/SecureDownload';
import Dashboard from './pages/Dashboard';
import Timeline from './pages/Timeline';
import EvidenceGallery from './pages/EvidenceGallery';
import LawyerPortal from './pages/LawyerPortal';
import UpdatePassword from './pages/UpdatePassword';
import UserProfile from './pages/UserProfile';
import Founders from './pages/Founders';

import ProtectedRoute from './components/layout/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      <Route path="/secure-download" element={<SecureDownload />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/evidence" element={<EvidenceGallery />} />
          <Route path="/lawyer" element={<LawyerPortal />} />
          <Route path="/founders" element={<Founders />} />
          <Route path="/profile" element={<UserProfile />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
