import { useEffect, useState } from 'react';
import { Factory, BarChart3, AlertTriangle } from 'lucide-react';

interface Obs { id: number; cm_name: string; cm_site: string; process: string; quoted_days: number; actual_days: number; pcs: number; yield_pct: number; observed_on: string; notes?: string; }
interface Summary { cm_name: string; process: string; n_obs: string; avg_actual_days: string; avg_quoted_days: string; avg_slip_days: string; avg_slip_pct: string; avg_yield_pct: string; total_pcs: string; }
interface Rank { cm_name: string; observations: string; total_pcs: string; avg_yield_pct: string; avg_slip_pct: string; composite_score: number; }

async function jget(p: string) {
  const t = localStorage.getItem('token') || '';
  const r = await fetch(`/api${p}`, { headers: { Authorization: `Bearer ${t}` } });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.statusText);
  return r.json();
}

const CMS = ['all', 'Foxconn', 'Pegatron', 'Jabil', 'Flex', 'Wistron', 'Sanmina'];

export default function CmLeadTimePage() {
  const [obs, setObs] = useState<Obs[]>([]);
  const [summary, setSummary] = useState<Summary[]>([]);
  const [ranking, setRanking] = useState<Rank[]>([]);
  const [slipAlerts, setSlipAlerts] = useState<Obs[]>([]);
  const [filter, setFilter] = useState('all');
  const [threshold, setThreshold] = useState(0.20);
  const [err, setErr] = useState('');

  async function load() {
    setErr('');
    try {
      const all = filter === 'all' ? await jget('/cm-lead-times') : await jget(`/cm-lead-times/cm/${filter}`);
      setObs(all);
      setSummary((await jget('/cm-lead-times/summary')));
      setRanking((await jget('/cm-lead-times/ranking')).ranking);
      setSlipAlerts((await jget(`/cm-lead-times/slip-alerts?threshold=${threshold}`)).items);
    } catch (e: any) { setErr(e.message); }
  }
  useEffect(() => { load(); }, [filter]);
  useEffect(() => { jget(`/cm-lead-times/slip-alerts?threshold=${threshold}`).then(d => setSlipAlerts(d.items)).catch(() => {}); }, [threshold]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Factory className="w-6 h-6 text-orange-500" /> CM Lead-Time Tracking</h1>
        <p className="text-gray-400 text-sm mt-1">Quoted vs actual across Foxconn / Pegatron / Jabil / Flex / Wistron / Sanmina | SMT / AOI / ICT / FATP / NPI</p>
      </div>
      {err && <div className="mb-4 bg-red-950 border border-red-800 text-red-300 p-3 rounded-lg text-sm">{err}</div>}

      <div className="flex gap-2 mb-4 flex-wrap">
        {CMS.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-xs ${filter === c ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>{c}</button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4 bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="text-gray-400 text-xs uppercase tracking-wider mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4" /> CM Composite Ranking</div>
          {ranking.map((r, i) => (
            <div key={r.cm_name} className="flex items-center gap-2 py-2 border-b border-gray-800">
              <span className="w-6 text-gray-500 text-xs">#{i + 1}</span>
              <span className="text-white text-sm font-medium flex-1">{r.cm_name}</span>
              <span className="text-xs text-gray-400">yld {Number(r.avg_yield_pct).toFixed(1)}%</span>
              <span className={`text-xs ${parseFloat(r.avg_slip_pct) > 10 ? 'text-yellow-400' : 'text-gray-400'}`}>slip {Number(r.avg_slip_pct).toFixed(0)}%</span>
              <span className="text-orange-400 text-xs font-bold w-12 text-right">{Number(r.composite_score).toFixed(1)}</span>
            </div>
          ))}
        </div>

        <div className="col-span-8 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">Recent Observations</div>
          <table className="w-full text-xs">
            <thead><tr className="text-gray-500">
              <th className="px-3 py-2 text-left">CM</th><th className="px-3 py-2 text-left">Site</th>
              <th className="px-3 py-2 text-left">Proc</th><th className="px-3 py-2 text-right">Quoted</th>
              <th className="px-3 py-2 text-right">Actual</th><th className="px-3 py-2 text-right">Slip%</th>
              <th className="px-3 py-2 text-right">Yield%</th><th className="px-3 py-2 text-right">Pcs</th>
              <th className="px-3 py-2 text-left">Observed</th>
            </tr></thead>
            <tbody>
              {obs.map(o => {
                const slip = ((o.actual_days - o.quoted_days) / Math.max(o.quoted_days, 1)) * 100;
                return (
                  <tr key={o.id} className="border-t border-gray-800">
                    <td className="px-3 py-2 text-white">{o.cm_name}</td>
                    <td className="px-3 py-2 text-gray-400">{o.cm_site}</td>
                    <td className="px-3 py-2"><span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300">{o.process}</span></td>
                    <td className="px-3 py-2 text-right text-gray-300">{o.quoted_days}d</td>
                    <td className="px-3 py-2 text-right text-gray-300">{o.actual_days}d</td>
                    <td className={`px-3 py-2 text-right ${slip > 20 ? 'text-red-400' : slip > 5 ? 'text-yellow-400' : 'text-green-400'}`}>{slip.toFixed(0)}%</td>
                    <td className="px-3 py-2 text-right text-gray-300">{Number(o.yield_pct).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right text-gray-400">{o.pcs?.toLocaleString()}</td>
                    <td className="px-3 py-2 text-gray-500">{o.observed_on?.split('T')[0]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="col-span-12 bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-gray-400 text-xs uppercase tracking-wider flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-400" /> Slip Alerts (above threshold)</div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs">threshold</span>
              <input type="number" step="0.05" value={threshold} onChange={e => setThreshold(parseFloat(e.target.value || '0'))}
                className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {slipAlerts.map(s => (
              <div key={s.id} className="bg-gray-800 rounded-lg p-2 text-xs">
                <div className="text-white font-medium">{s.cm_name} · {s.cm_site}</div>
                <div className="text-gray-400">{s.process} | quoted {s.quoted_days}d / actual {s.actual_days}d</div>
                <div className="text-yellow-400">slip {(((s.actual_days - s.quoted_days) / Math.max(s.quoted_days, 1)) * 100).toFixed(0)}%</div>
                {s.notes && <div className="text-gray-500 mt-1">{s.notes}</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">Summary (CM × Process)</div>
          <table className="w-full text-xs">
            <thead><tr className="text-gray-500">
              <th className="px-3 py-2 text-left">CM</th><th className="px-3 py-2 text-left">Process</th>
              <th className="px-3 py-2 text-right">N</th><th className="px-3 py-2 text-right">Avg Quoted</th>
              <th className="px-3 py-2 text-right">Avg Actual</th><th className="px-3 py-2 text-right">Avg Slip d</th>
              <th className="px-3 py-2 text-right">Avg Slip %</th><th className="px-3 py-2 text-right">Avg Yield %</th>
            </tr></thead>
            <tbody>
              {summary.map((s, i) => (
                <tr key={i} className="border-t border-gray-800">
                  <td className="px-3 py-2 text-white">{s.cm_name}</td>
                  <td className="px-3 py-2 text-gray-400">{s.process}</td>
                  <td className="px-3 py-2 text-right text-gray-400">{s.n_obs}</td>
                  <td className="px-3 py-2 text-right text-gray-300">{s.avg_quoted_days}d</td>
                  <td className="px-3 py-2 text-right text-gray-300">{s.avg_actual_days}d</td>
                  <td className="px-3 py-2 text-right text-gray-300">{s.avg_slip_days}d</td>
                  <td className={`px-3 py-2 text-right ${parseFloat(s.avg_slip_pct) > 15 ? 'text-red-400' : 'text-gray-300'}`}>{s.avg_slip_pct}%</td>
                  <td className="px-3 py-2 text-right text-green-400">{s.avg_yield_pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
