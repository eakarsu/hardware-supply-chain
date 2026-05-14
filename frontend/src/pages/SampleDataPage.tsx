import { useState } from 'react';
import { Database, Package, Truck, ShoppingCart, GitBranch, CheckSquare, Factory, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

type Entity = 'parts' | 'suppliers' | 'manufacturers' | 'orders' | 'iterations' | 'quality';

interface EntityDef {
  key: Entity;
  label: string;
  description: string;
  icon: typeof Package;
  color: string;
}

const ENTITIES: EntityDef[] = [
  { key: 'parts', label: 'Parts', description: 'PCBs, GPUs (NVIDIA H100), CPUs (AMD EPYC, Intel Xeon), DDR5 modules, fasteners', icon: Package, color: 'bg-orange-600 hover:bg-orange-700' },
  { key: 'suppliers', label: 'Suppliers', description: 'Foxconn, Pegatron, Wistron, TSMC, Murata, Samsung Semiconductor, Bossard', icon: Truck, color: 'bg-blue-600 hover:bg-blue-700' },
  { key: 'manufacturers', label: 'Manufacturers', description: 'Foxconn Zhengzhou, Jabil, Flex, Celestica, Sanmina, Quanta, Inventec', icon: Factory, color: 'bg-purple-600 hover:bg-purple-700' },
  { key: 'orders', label: 'Orders', description: 'Purchase orders linked to seeded parts and suppliers', icon: ShoppingCart, color: 'bg-emerald-600 hover:bg-emerald-700' },
  { key: 'iterations', label: 'Design Iterations', description: 'PCB rev history (signal integrity, thermal, EMI, DFM)', icon: GitBranch, color: 'bg-cyan-600 hover:bg-cyan-700' },
  { key: 'quality', label: 'Quality Checks', description: 'AOI/X-ray/ICT inspections with defect modes (BGA voiding, solder bridge)', icon: CheckSquare, color: 'bg-rose-600 hover:bg-rose-700' },
];

interface ResultState {
  entity: Entity;
  ok: boolean;
  message: string;
}

export default function SampleDataPage() {
  const [busy, setBusy] = useState<Entity | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ResultState | null>(null);

  const handleSeed = async (entity: Entity) => {
    setBusy(entity);
    setResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/sample-data/${entity}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ entity, ok: false, message: data.error || `HTTP ${res.status}` });
      } else {
        setCounts(c => ({ ...c, [entity]: (c[entity] || 0) + (data.inserted || 0) }));
        setResult({ entity, ok: true, message: `Inserted ${data.inserted} ${entity} row(s)` });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Network error';
      setResult({ entity, ok: false, message: msg });
    } finally {
      setBusy(null);
      setTimeout(() => setResult(prev => (prev && prev.entity === entity ? null : prev)), 4000);
    }
  };

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center">
          <Database className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Sample Data</h1>
          <p className="text-gray-400 text-sm">Seed each entity with 5-10 domain-realistic rows for demo and testing.</p>
        </div>
      </div>

      <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3 mt-4 mb-6 text-sm text-yellow-200">
        Tip: seed <span className="font-semibold">Parts</span> and <span className="font-semibold">Suppliers</span> first — Orders, Iterations and Quality reference them.
      </div>

      {result && (
        <div className={`mb-4 flex items-center gap-2 rounded-lg p-3 text-sm border ${result.ok ? 'bg-green-900/30 border-green-700 text-green-200' : 'bg-red-900/30 border-red-700 text-red-200'}`}>
          {result.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="font-medium capitalize">{result.entity}:</span>
          <span>{result.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ENTITIES.map(({ key, label, description, icon: Icon, color }) => {
          const seeded = counts[key] || 0;
          const isBusy = busy === key;
          return (
            <div key={key} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-gray-300" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{label}</h3>
                    {seeded > 0 && (
                      <p className="text-xs text-green-400 mt-0.5">Seeded: {seeded} row(s)</p>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4 min-h-[40px]">{description}</p>
              <button
                onClick={() => handleSeed(key)}
                disabled={isBusy}
                className={`w-full text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${color} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isBusy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Seeding...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" /> Insert sample {label.toLowerCase()}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
