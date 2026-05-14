import { useState } from 'react';
import { api } from '../api';
import { Download, FileText } from 'lucide-react';

const ENTITIES: { id: string; label: string; description: string }[] = [
  { id: 'parts', label: 'Parts', description: 'Full parts catalog with stock and cost.' },
  { id: 'suppliers', label: 'Suppliers', description: 'Supplier directory with reliability and certifications.' },
  { id: 'orders', label: 'Orders', description: 'All purchase orders with part and supplier names joined.' },
  { id: 'iterations', label: 'Design Iterations', description: 'Engineering iteration history per part.' },
  { id: 'quality', label: 'Quality Checks', description: 'Incoming inspection records and defect rates.' },
  { id: 'manufacturers', label: 'Manufacturers', description: 'Manufacturing partners and capacities.' },
];

export default function ExportPage() {
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState('');

  const exportEntity = async (entity: string) => {
    setBusy(entity); setErr('');
    try {
      await api.exportCsv(entity);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Download className="w-6 h-6 text-orange-500" />
        <div>
          <h1 className="text-2xl font-bold text-white">CSV Export</h1>
          <p className="text-gray-400 text-sm">Download any dataset as a CSV file.</p>
        </div>
      </div>

      {err && <div className="text-red-400 text-sm mb-4">{err}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ENTITIES.map(e => (
          <div key={e.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-orange-900/40 flex items-center justify-center">
                <FileText className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">{e.label}</h3>
                <p className="text-gray-500 text-xs mt-0.5">{e.description}</p>
              </div>
            </div>
            <button onClick={() => exportEntity(e.id)} disabled={busy === e.id}
              className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">
              <Download className="w-4 h-4" />
              {busy === e.id ? 'Exporting...' : 'Download CSV'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
