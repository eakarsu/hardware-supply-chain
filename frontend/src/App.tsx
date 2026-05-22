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
import BomPage from './pages/BomPage';
import ComponentsPage from './pages/ComponentsPage';
import LandedCostPage from './pages/LandedCostPage';
import CmLeadTimePage from './pages/CmLeadTimePage';
import DfmPage from './pages/DfmPage';
import EcnPage from './pages/EcnPage';
import AqlPage from './pages/AqlPage';
import CustomViewsPage from './pages/CustomViewsPage';
import IterationSpeedPage from './pages/IterationSpeedPage';
import GoldenSampleControl from './pages/GoldenSampleControl';

import CfDfmAgent from './pages/CfDfmAgent';
import CfPortDisruption from './pages/CfPortDisruption';
import CfRfqBlast from './pages/CfRfqBlast';
import CfShenzhenTracker from './pages/CfShenzhenTracker';
import CfTariffSourcing from './pages/CfTariffSourcing';
import GapCadUpload from './pages/GapCadUpload';
import GapCustomsTariff from './pages/GapCustomsTariff';
import GapDfmAdvisor from './pages/GapDfmAdvisor';
import GapEdiPortal from './pages/GapEdiPortal';
import GapFactoryHandoff from './pages/GapFactoryHandoff';
import GapIncomingInspection from './pages/GapIncomingInspection';
import GapMobileIntake from './pages/GapMobileIntake';
import GapPaymentsLc from './pages/GapPaymentsLc';
import GapQrTracking from './pages/GapQrTracking';
import GapShenzhenVsUs from './pages/GapShenzhenVsUs';
import GapShippingTracking from './pages/GapShippingTracking';

import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

import TimelineView from './pages/TimelineView';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/insights/timeline" element={<TimelineView />} />
        <Route path="/codex/custom-viz" element={<CodexCustomVizFeature />} />
        <Route path="/codex/operations" element={<CodexOperationsFeature />} />

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
          <Route path="bom" element={<BomPage />} />
          <Route path="components" element={<ComponentsPage />} />
          <Route path="landed-cost" element={<LandedCostPage />} />
          <Route path="cm-lead-times" element={<CmLeadTimePage />} />
          <Route path="dfm" element={<DfmPage />} />
          <Route path="ecn" element={<EcnPage />} />
          <Route path="aql" element={<AqlPage />} />
          <Route path="custom-views" element={<CustomViewsPage />} />
          <Route path="iteration-speed" element={<IterationSpeedPage />} />
          <Route path="golden-sample-control" element={<GoldenSampleControl />} />

          <Route path="cf/dfm-agent" element={<CfDfmAgent />} />
          <Route path="cf/port-disruption" element={<CfPortDisruption />} />
          <Route path="cf/rfq-blast" element={<CfRfqBlast />} />
          <Route path="cf/shenzhen-tracker" element={<CfShenzhenTracker />} />
          <Route path="cf/tariff-sourcing" element={<CfTariffSourcing />} />
          <Route path="gap/cad-upload" element={<GapCadUpload />} />
          <Route path="gap/customs-tariff" element={<GapCustomsTariff />} />
          <Route path="gap/dfm-advisor" element={<GapDfmAdvisor />} />
          <Route path="gap/edi-portal" element={<GapEdiPortal />} />
          <Route path="gap/factory-handoff" element={<GapFactoryHandoff />} />
          <Route path="gap/incoming-inspection" element={<GapIncomingInspection />} />
          <Route path="gap/mobile-intake" element={<GapMobileIntake />} />
          <Route path="gap/payments-lc" element={<GapPaymentsLc />} />
          <Route path="gap/qr-tracking" element={<GapQrTracking />} />
          <Route path="gap/shenzhen-vs-us" element={<GapShenzhenVsUs />} />
          <Route path="gap/shipping-tracking" element={<GapShippingTracking />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
