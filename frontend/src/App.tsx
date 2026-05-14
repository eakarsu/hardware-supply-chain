import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PartsPage from './pages/PartsPage';
import SuppliersPage from './pages/SuppliersPage';
import OrdersPage from './pages/OrdersPage';
import IterationsPage from './pages/IterationsPage';
import QualityPage from './pages/QualityPage';
import ManufacturersPage from './pages/ManufacturersPage';
import AICenterPage from './pages/AICenterPage';
import SearchPage from './pages/SearchPage';
import AuditLogPage from './pages/AuditLogPage';
import ExportPage from './pages/ExportPage';
import SampleDataPage from './pages/SampleDataPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="parts" element={<PartsPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="iterations" element={<IterationsPage />} />
          <Route path="quality" element={<QualityPage />} />
          <Route path="manufacturers" element={<ManufacturersPage />} />
          <Route path="ai" element={<AICenterPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="audit" element={<AuditLogPage />} />
          <Route path="export" element={<ExportPage />} />
          <Route path="sample-data" element={<SampleDataPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
