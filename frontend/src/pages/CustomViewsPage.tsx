import LeadTimeChart from '../components/LeadTimeChart';
import SupplierHeatmap from '../components/SupplierHeatmap';
import BomPdfExporter from '../components/BomPdfExporter';
import SupplierRulesEditor from '../components/SupplierRulesEditor';
import { Eye } from 'lucide-react';

export default function CustomViewsPage() {
  return (
    <div className="p-6" data-testid="custom-views-page">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-orange-600/20 flex items-center justify-center">
          <Eye className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Supply Views</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Custom analytics & operations tools for hardware supply chain.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <LeadTimeChart />
        <SupplierHeatmap />
        <BomPdfExporter />
        <SupplierRulesEditor />
      </div>
    </div>
  );
}
