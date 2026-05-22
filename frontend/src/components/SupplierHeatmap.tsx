import { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { Grid3x3 } from 'lucide-react';

interface Cell {
  category: string;
  reliability: number | null;
  avg_lead_days: number | null;
  supplier_count: number;
}
interface Row {
  country: string;
  cells: Cell[];
}
interface Resp {
  generated_at: string;
  countries: string[];
  categories: string[];
  matrix: Row[];
}

function colorFor(rel: number | null): string {
  if (rel == null) return 'bg-gray-800 text-gray-600';
  if (rel >= 9.3) return 'bg-emerald-600/70 text-white';
  if (rel >= 9.0) return 'bg-emerald-500/50 text-white';
  if (rel >= 8.5) return 'bg-yellow-500/50 text-white';
  if (rel >= 8.0) return 'bg-orange-500/50 text-white';
  return 'bg-red-600/60 text-white';
}

export default function SupplierHeatmap() {
  const [data, setData] = useState<Resp | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    apiFetch('/custom-views/supplier-heatmap')
      .then(r => setData(r as Resp))
      .catch(e => setErr(e.message));
  }, []);

  if (err) return <div className="text-red-400 text-sm">Failed: {err}</div>;
  if (!data) return <div className="text-gray-500 text-sm">Loading heatmap…</div>;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5" data-testid="supplier-heatmap">
      <div className="flex items-center gap-2 mb-4">
        <Grid3x3 className="w-4 h-4 text-cyan-400" />
        <h3 className="text-white font-semibold text-sm">Supplier Reliability Heatmap</h3>
        <span className="ml-auto text-xs text-gray-500">
          {data.countries.length} countries × {data.categories.length} categories
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="text-xs min-w-full">
          <thead>
            <tr>
              <th className="text-left text-gray-500 font-medium pr-3 pb-2">Country</th>
              {data.categories.map(c => (
                <th key={c} className="px-1 pb-2 text-gray-500 font-medium capitalize">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.matrix.map(row => (
              <tr key={row.country}>
                <td className="text-gray-300 pr-3 py-1 whitespace-nowrap">{row.country}</td>
                {row.cells.map(cell => (
                  <td key={cell.category} className="p-1">
                    <div
                      className={`rounded px-2 py-1 text-center min-w-[44px] ${colorFor(cell.reliability)}`}
                      title={`${row.country}/${cell.category}: rel ${cell.reliability ?? 'n/a'}, lead ${cell.avg_lead_days ?? 'n/a'}d, ${cell.supplier_count} suppliers`}
                    >
                      {cell.reliability != null ? cell.reliability.toFixed(1) : '—'}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center gap-3 text-[10px] text-gray-500">
        <span className="px-2 py-0.5 rounded bg-red-600/60 text-white">&lt;8.0</span>
        <span className="px-2 py-0.5 rounded bg-orange-500/50 text-white">8.0+</span>
        <span className="px-2 py-0.5 rounded bg-yellow-500/50 text-white">8.5+</span>
        <span className="px-2 py-0.5 rounded bg-emerald-500/50 text-white">9.0+</span>
        <span className="px-2 py-0.5 rounded bg-emerald-600/70 text-white">9.3+</span>
      </div>
    </div>
  );
}
