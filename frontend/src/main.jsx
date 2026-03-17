import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
} from 'react-router-dom';

import Dashboard from './User/components/Dashboard.jsx';
import Calendar from './user/components/Calendar.jsx';
import ApplyLeave from './User/components/ApplyLeave.jsx';

import Admindashboard from './Admin/components/Admindashboard.jsx';
import AdminLeaveRequests from './Admin/components/AdminLeaveRequests.jsx';
import AddAdjustment from './Admin/components/AddAdjustment.jsx';
import AdminCalendar from './Admin/components/AdminCalendar.jsx';

import Login from './Shared/Login.jsx';
import Adminapp from './Admin/components/Adminapp.jsx';
import ProtectedRoute from './Shared/ProtectedRoute.jsx';
import PublicRoute from './Shared/PublicRoute.jsx';
import LandingPage from './Pages/LandingPage.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>

      {/* ── Landing page (public — redirect if logged in) ── */}
      <Route path="/" element={
        <PublicRoute><LandingPage /></PublicRoute>
      } />

      {/* ── Login (public — redirect if logged in) ── */}
      <Route path="/login" element={
        <PublicRoute><Login /></PublicRoute>
      } />

      {/* ── User routes ── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="user">
            <App />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="apply-leave" element={<ApplyLeave />} />
      </Route>

      {/* ── Admin routes ── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <Adminapp />
          </ProtectedRoute>
        }
      >
        <Route index element={<Admindashboard />} />
        <Route path="dashboard" element={<Admindashboard />} />
        <Route path="add-adjustment" element={<AddAdjustment />} />
        <Route path="applyleave" element={<AdminLeaveRequests />} />
        <Route path="calendar" element={<AdminCalendar />} />
      </Route>

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </>
  )
);

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);