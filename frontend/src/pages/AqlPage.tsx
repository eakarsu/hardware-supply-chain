import { useEffect, useState } from 'react';
import { CheckSquare, Play, Save } from 'lucide-react';

interface Plan { id: number; lot_size_min: number; lot_size_max: number; inspection_level: string; code_letter: string; aql_pct: number; sample_size: number; accept: number; reject: number; plan_type: string; }
interface Inspection { id: number; order_id: number; plan_id: number; lot_size: number; sample_size: number; defects_found: number; decision: string; inspector: string; inspected_at: string; code_letter?: string; aql_pct?: number; plan_type?: string; }

async function jget(p: string) {
  const t = localStorage.getItem('token') || '';
  const r = await fetch(`/api${p}`, { headers: { Authorization: `Bearer ${t}` } });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.statusText);
  return r.json();
}
async function jpost(p: string, body: any) {
  const t = localStorage.getItem('token') || '';
  const r = await fetch(`/api${p}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.statusText);
  return r.json();
}

export default function AqlPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [planType, setPlanType] = useState('normal');
  const [err, setErr] = useState('');
  const [calc, setCalc] = useState<any>({ lot: 2000, aql: 1.0, level: 'II', type: 'normal', defects: 3 });
  const [result, setResult] = useState<any>(null);
  const [record, setRecord] = useState<any>({ order_id: '', lot_size: 2000, aql: 1.0, level: 'II', plan_type: 'normal', defects_found: 0, inspector: '' });

  async function load() {
    setErr('');
    try {
      setPlans(await jget('/aql/plans'));
      setInspections(await jget('/aql/inspection'));
    } catch (e: any) { setErr(e.message); }
  }
  useEffect(() => { load(); }, []);

  async function runCalc() {
    setErr('');
    try { setResult(await jpost('/aql/run', calc)); }
    catch (e: any) { setErr(e.message); }
  }

  async function recordInspection() {
    setErr('');
    try { await jpost('/aql/inspection', record); load(); }
    catch (e: any) { setErr(e.message); }
  }

  const filteredPlans = plans.filter(p => p.plan_type === planType);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><CheckSquare className="w-6 h-6 text-orange-500" /> AQL Inspection Plans (ISO 2859-1)</h1>
        <p className="text-gray-400 text-sm mt-1">Single-sampling plans by lot size and AQL %. Code letter determines sample size; accept/reject thresholds drive decision.</p>
      </div>
      {err && <div className="mb-4 bg-red-950 border border-red-800 text-red-300 p-3 rounded-lg text-sm">{err}</div>}

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-800 flex items-center gap-2">
            <div className="text-gray-400 text-xs uppercase tracking-wider">Plans</div>
            <div className="flex gap-1 ml-auto">
              {['normal', 'tightened', 'reduced'].map(t => (
                <button key={t} onClick={() => setPlanType(t)}
                  className={`px-2 py-0.5 rounded text-xs ${planType === t ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>{t}</button>
              ))}
            </div>
          </div>
          <table className="w-full text-xs">
            <thead><tr className="text-gray-500">
              <th className="px-3 py-2 text-left">Lot range</th><th className="px-3 py-2 text-left">Level</th>
              <th className="px-3 py-2 text-left">Code</th><th className="px-3 py-2 text-right">AQL%</th>
              <th className="px-3 py-2 text-right">Sample</th><th className="px-3 py-2 text-right">Ac</th>
              <th className="px-3 py-2 text-right">Re</th>
            </tr></thead>
            <tbody>
              {filteredPlans.map(p => (
                <tr key={p.id} className="border-t border-gray-800">
                  <td className="px-3 py-2 text-gray-300">{p.lot_size_min}-{p.lot_size_max}</td>
                  <td className="px-3 py-2 text-gray-400">{p.inspection_level}</td>
                  <td className="px-3 py-2 text-orange-400 font-mono">{p.code_letter}</td>
                  <td className="px-3 py-2 text-right text-gray-300">{Number(p.aql_pct).toFixed(2)}</td>
                  <td className="px-3 py-2 text-right text-white">{p.sample_size}</td>
                  <td className="px-3 py-2 text-right text-green-400">{p.accept}</td>
                  <td className="px-3 py-2 text-right text-red-400">{p.reject}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="col-span-5 space-y-3">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-3 flex items-center gap-2"><Play className="w-3 h-3" /> Decision Calculator</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="text-gray-400">Lot size
                <input type="number" value={calc.lot} onChange={e => setCalc({ ...calc, lot: parseInt(e.target.value, 10) })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs mt-1" /></label>
              <label className="text-gray-400">AQL %
                <input type="number" step="0.1" value={calc.aql} onChange={e => setCalc({ ...calc, aql: parseFloat(e.target.value) })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs mt-1" /></label>
              <label className="text-gray-400">Level
                <select value={calc.level} onChange={e => setCalc({ ...calc, level: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs mt-1">
                  <option>I</option><option>II</option><option>III</option>
                </select></label>
              <label className="text-gray-400">Type
                <select value={calc.type} onChange={e => setCalc({ ...calc, type: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs mt-1">
                  <option>normal</option><option>tightened</option><option>reduced</option>
                </select></label>
              <label className="text-gray-400 col-span-2">Defects found
                <input type="number" value={calc.defects} onChange={e => setCalc({ ...calc, defects: parseInt(e.target.value, 10) })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs mt-1" /></label>
            </div>
            <button onClick={runCalc} className="mt-3 w-full bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded text-xs">Compute decision</button>
            {result && (
              <div className={`mt-3 rounded-lg p-3 text-xs ${result.decision === 'accept' ? 'bg-green-950 border border-green-800' : 'bg-red-950 border border-red-800'}`}>
                <div className={`font-bold ${result.decision === 'accept' ? 'text-green-300' : 'text-red-300'}`}>{result.decision.toUpperCase()}</div>
                <div className="text-gray-300 mt-1">{result.reason}</div>
                <div className="text-gray-500 mt-1">Plan: code {result.plan.code_letter} | n={result.plan.sample_size} | Ac={result.plan.accept} | Re={result.plan.reject}</div>
              </div>
            )}
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-3 flex items-center gap-2"><Save className="w-3 h-3" /> Record Inspection</div>
            <div className="space-y-2 text-xs">
              <input type="number" placeholder="Order ID" value={record.order_id} onChange={e => setRecord({ ...record, order_id: parseInt(e.target.value, 10) })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white" />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Lot size" value={record.lot_size} onChange={e => setRecord({ ...record, lot_size: parseInt(e.target.value, 10) })} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white" />
                <input type="number" step="0.1" placeholder="AQL %" value={record.aql} onChange={e => setRecord({ ...record, aql: parseFloat(e.target.value) })} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white" />
              </div>
              <input type="number" placeholder="Defects found" value={record.defects_found} onChange={e => setRecord({ ...record, defects_found: parseInt(e.target.value, 10) })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white" />
              <input placeholder="Inspector" value={record.inspector} onChange={e => setRecord({ ...record, inspector: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white" />
              <button onClick={recordInspection} className="w-full bg-violet-700 hover:bg-violet-600 text-white px-2 py-1.5 rounded">Save</button>
            </div>
          </div>
        </div>

        <div className="col-span-12 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">Recorded Inspections</div>
          <table className="w-full text-xs">
            <thead><tr className="text-gray-500">
              <th className="px-3 py-2 text-left">Order</th><th className="px-3 py-2 text-left">Plan</th>
              <th className="px-3 py-2 text-right">Lot</th><th className="px-3 py-2 text-right">Sample</th>
              <th className="px-3 py-2 text-right">Defects</th><th className="px-3 py-2 text-left">Decision</th>
              <th className="px-3 py-2 text-left">Inspector</th>
            </tr></thead>
            <tbody>
              {inspections.map(i => (
                <tr key={i.id} className="border-t border-gray-800">
                  <td className="px-3 py-2 text-gray-300">#{i.order_id}</td>
                  <td className="px-3 py-2 text-gray-400">code {i.code_letter} | AQL {i.aql_pct}% | {i.plan_type}</td>
                  <td className="px-3 py-2 text-right text-gray-300">{i.lot_size}</td>
                  <td className="px-3 py-2 text-right text-gray-300">{i.sample_size}</td>
                  <td className="px-3 py-2 text-right text-gray-300">{i.defects_found}</td>
                  <td className={`px-3 py-2 ${i.decision === 'accept' ? 'text-green-400' : 'text-red-400'}`}>{i.decision}</td>
                  <td className="px-3 py-2 text-gray-400">{i.inspector}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
