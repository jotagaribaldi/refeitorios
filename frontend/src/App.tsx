import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TenantsPage from './pages/TenantsPage';
import RestaurantsPage from './pages/RestaurantsPage';
import UsersPage from './pages/UsersPage';
import AllowancesPage from './pages/AllowancesPage';
import ConsumptionsPage from './pages/ConsumptionsPage';
import MealTypesPage from './pages/MealTypesPage';
import ScanPage from './pages/ScanPage';
import MyConsumptionsPage from './pages/MyConsumptionsPage';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function HomeRedirect() {
  const { user } = useAuth();
  if (user?.role === 'FUNCIONARIO') return <Navigate to="/scan" replace />;
  return <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><AppLayout><HomeRedirect /></AppLayout></ProtectedRoute>} />

      <Route path="/dashboard" element={
        <ProtectedRoute roles={['ROOT', 'GERENTE']}>
          <AppLayout><DashboardPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/tenants" element={
        <ProtectedRoute roles={['ROOT']}>
          <AppLayout><TenantsPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/restaurants" element={
        <ProtectedRoute roles={['ROOT', 'GERENTE']}>
          <AppLayout><RestaurantsPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/users" element={
        <ProtectedRoute roles={['ROOT', 'GERENTE']}>
          <AppLayout><UsersPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/allowances" element={
        <ProtectedRoute roles={['ROOT', 'GERENTE']}>
          <AppLayout><AllowancesPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/consumptions" element={
        <ProtectedRoute roles={['ROOT', 'GERENTE']}>
          <AppLayout><ConsumptionsPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/meal-types" element={
        <ProtectedRoute roles={['ROOT', 'GERENTE']}>
          <AppLayout><MealTypesPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/scan" element={
        <ProtectedRoute roles={['FUNCIONARIO']}>
          <AppLayout><ScanPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/my-consumptions" element={
        <ProtectedRoute roles={['FUNCIONARIO']}>
          <AppLayout><MyConsumptionsPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
