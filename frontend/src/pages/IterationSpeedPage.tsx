import { useEffect, useState } from 'react';
import { api } from '../api';
import { Activity, Trophy, Gauge, Plus, Trash2 } from 'lucide-react';

interface SpeedSummary {
  overall: {
    total_iterations: number;
    successful: number;
    avg_hours: number | null;
    min_hours: number | null;
    max_hours: number | null;
    median_hours: number | null;
  };
  by_engineer: { engineer: string; iterations: number; avg_hours: number | null; success_rate: number | null }[];
  fastest_parts: { id: number; part_number: string; name: string; category: string | null; avg_hours: number | null; iteration_count: number }[];
  weekly_trend: { week: string; iterations: number; avg_hours: number | null }[];
  reference_baselines: {
    shenzhen_hours: number;
    us_typical_hours: number;
    team_vs_shenzhen_multiplier: number | null;
    team_vs_us_multiplier: number | null;
  };
  custom_baselines: { region: string; part_category: string | null; baseline_hours: number; source: string | null }[];
}

export default function IterationSpeedPage() {
  const [data, setData] = useState<SpeedSummary | null>(null);
  const [error, setError] = useState('');
  const [region, setRegion] = useState('');
  const [category, setCategory] = useState('');
  const [hours, setHours] = useState('');
  const [source, setSource] = useState('');

  function load() {
    api.getIterationSpeed()
      .then((r) => setData(r as SpeedSummary))
      .catch((e) => setError(e.message));
  }

  useEffect(() => { load(); }, []);

  async function addBaseline(e: React.FormEvent) {
    e.preventDefault();
    if (!region || !hours) return;
    try {
      await api.addIterationBaseline({
        region, part_category: category || null,
        baseline_hours: Number(hours), source: source || null,
      });
      setRegion(''); setCategory(''); setHours(''); setSource('');
      load();
    } catch (e: any) { setError(e.message); }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Gauge className="w-6 h-6 text-orange-400" /> Iteration Speed
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Hardware loop time vs. Shenzhen / US baselines - the core mission metric.
        </p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-500">Total iterations</div>
          <div className="text-2xl font-bold text-white">{data?.overall.total_iterations ?? '-'}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-500">Avg loop (hrs)</div>
          <div className="text-2xl font-bold text-orange-400">{data?.overall.avg_hours ?? '-'}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-500">Median loop (hrs)</div>
          <div className="text-2xl font-bold text-white">{data?.overall.median_hours ?? '-'}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-500">Successful</div>
          <div className="text-2xl font-bold text-emerald-400">{data?.overall.successful ?? '-'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-orange-400" />
            <h3 className="text-white font-semibold text-sm">Reference Baselines</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-gray-400 text-xs">Shenzhen (target)</div>
              <div className="text-white text-xl font-bold">{data?.reference_baselines.shenzhen_hours} hrs</div>
              <div className="text-orange-400 text-xs mt-1">
                Team is {data?.reference_baselines.team_vs_shenzhen_multiplier ?? '-'}x slower
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-gray-400 text-xs">US typical</div>
              <div className="text-white text-xl font-bold">{data?.reference_baselines.us_typical_hours} hrs</div>
              <div className="text-emerald-400 text-xs mt-1">
                Team is {data?.reference_baselines.team_vs_us_multiplier ?? '-'}x of US typical
              </div>
            </div>
          </div>
          {data && data.custom_baselines.length > 0 && (
            <div className="mt-4">
              <div className="text-xs text-gray-500 mb-2">Custom baselines</div>
              <ul className="text-sm text-gray-300 space-y-1">
                {data.custom_baselines.map((b, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-orange-400">{b.region}</span>
                    {b.part_category && <span className="text-gray-500">/ {b.part_category}</span>}
                    <span>: {b.baseline_hours}h</span>
                    {b.source && <span className="text-gray-600">({b.source})</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Plus className="w-4 h-4 text-orange-400" />
            <h3 className="text-white font-semibold text-sm">Add baseline</h3>
          </div>
          <form onSubmit={addBaseline} className="space-y-2">
            <input value={region} onChange={(e) => setRegion(e.target.value)}
              placeholder="Region (e.g. Shenzhen)"
              className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700" />
            <input value={category} onChange={(e) => setCategory(e.target.value)}
              placeholder="Category (optional)"
              className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700" />
            <input value={hours} onChange={(e) => setHours(e.target.value)}
              type="number" step="0.1" placeholder="Baseline hours"
              className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700" />
            <input value={source} onChange={(e) => setSource(e.target.value)}
              placeholder="Source (optional)"
              className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700" />
            <button type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg py-2">
              Save baseline
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl">
          <div className="p-5 border-b border-gray-800 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <h3 className="text-white font-semibold text-sm">Fastest engineers</h3>
          </div>
          <div className="divide-y divide-gray-800">
            {data?.by_engineer.length === 0 && (
              <div className="p-4 text-gray-500 text-sm">No iteration data yet</div>
            )}
            {data?.by_engineer.map((e, i) => (
              <div key={i} className="p-3 flex items-center gap-3 text-sm">
                <span className="w-6 text-gray-500 text-xs">{i + 1}.</span>
                <span className="text-white flex-1">{e.engineer}</span>
                <span className="text-gray-400">{e.iterations} iter</span>
                <span className="text-orange-400 font-medium">{e.avg_hours ?? '-'}h</span>
                <span className="text-emerald-400 text-xs">{e.success_rate ?? '-'}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl">
          <div className="p-5 border-b border-gray-800 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-violet-400" />
            <h3 className="text-white font-semibold text-sm">Fastest parts to iterate</h3>
          </div>
          <div className="divide-y divide-gray-800">
            {data?.fastest_parts.length === 0 && (
              <div className="p-4 text-gray-500 text-sm">No part-level data yet</div>
            )}
            {data?.fastest_parts.map((p, i) => (
              <div key={p.id} className="p-3 flex items-center gap-3 text-sm">
                <span className="w-6 text-gray-500 text-xs">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white truncate">{p.name}</div>
                  <div className="text-gray-500 text-xs">{p.part_number} {p.category ? `- ${p.category}` : ''}</div>
                </div>
                <span className="text-orange-400 font-medium">{p.avg_hours ?? '-'}h</span>
                <span className="text-gray-400 text-xs">{p.iteration_count}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {data && data.weekly_trend.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl mt-6">
          <div className="p-5 border-b border-gray-800">
            <h3 className="text-white font-semibold text-sm">Weekly trend (last 180d)</h3>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs">
                  <th className="text-left pb-2">Week</th>
                  <th className="text-right pb-2">Iterations</th>
                  <th className="text-right pb-2">Avg hours</th>
                </tr>
              </thead>
              <tbody>
                {data.weekly_trend.map((w, i) => (
                  <tr key={i} className="border-t border-gray-800">
                    <td className="py-2 text-gray-300">{w.week}</td>
                    <td className="py-2 text-right text-white">{w.iterations}</td>
                    <td className="py-2 text-right text-orange-400">{w.avg_hours ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
