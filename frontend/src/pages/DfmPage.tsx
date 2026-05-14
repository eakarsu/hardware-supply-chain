import { useEffect, useState } from 'react';
import { CheckSquare, Play, Shield } from 'lucide-react';

interface Check { id: number; bom_id: number; rule_code: string; rule_description: string; severity: string; location: string; measured_value: string; spec_value: string; status: string; waiver_reason?: string; }
interface BomHeader { id: number; product_name: string; revision: string; }

const SEV_COLOR: Record<string, string> = {
  fail: 'bg-red-900 text-red-300',
  warn: 'bg-yellow-900 text-yellow-300',
  info: 'bg-blue-900 text-blue-300',
};
const STATUS_COLOR: Record<string, string> = {
  open: 'bg-orange-900 text-orange-300',
  fixed: 'bg-green-900 text-green-300',
  waived: 'bg-gray-700 text-gray-300',
};

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

export default function DfmPage() {
  const [boms, setBoms] = useState<BomHeader[]>([]);
  const [bomId, setBomId] = useState<number | null>(null);
  const [report, setReport] = useState<any>(null);
  const [rules, setRules] = useState<any>({});
  const [err, setErr] = useState('');

  const [measure, setMeasure] = useState<any>({
    acute_angle_deg: 24, acute_angle_location: 'GND L4 cutout',
    bga_pitch_mm: 0.65, bga_location: 'U17', layers: 4, via_in_pad: false,
    pour_to_edge_mm: 0.10,
    flex_bend_radius_mm: 2.0, flex_thickness_mm: 0.5, flex_location: 'FPC J3-J4',
    silk_overlaps_pad: true, silk_location: 'U2 pin 1',
    trace_to_edge_mm: 0.20, trace_location: 'L1 edge',
  });

  async function load() {
    setErr('');
    try {
      setBoms(await jget('/bom'));
      setRules(await jget('/dfm/rules'));
    } catch (e: any) { setErr(e.message); }
  }
  useEffect(() => { load(); }, []);

  async function loadReport(id: number) {
    setBomId(id); setErr('');
    try { setReport(await jget(`/dfm/bom/${id}`)); }
    catch (e: any) { setErr(e.message); }
  }

  async function runChecks() {
    if (!bomId) return;
    setErr('');
    try {
      await jpost(`/dfm/run/${bomId}`, { measurements: measure });
      loadReport(bomId);
    } catch (e: any) { setErr(e.message); }
  }

  async function waive(id: number) {
    const reason = window.prompt('Waiver reason?') || 'no reason';
    try { await jpost(`/dfm/${id}/waive`, { reason }); if (bomId) loadReport(bomId); }
    catch (e: any) { setErr(e.message); }
  }
  async function resolve(id: number) {
    try { await jpost(`/dfm/${id}/resolve`, {}); if (bomId) loadReport(bomId); }
    catch (e: any) { setErr(e.message); }
  }

  function setM(k: string, v: any) { setMeasure({ ...measure, [k]: v }); }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><CheckSquare className="w-6 h-6 text-orange-500" /> DFM / DFA Checks</h1>
        <p className="text-gray-400 text-sm mt-1">Acute angles, BGA pitch, copper pour, FPC bend radius, silk-over-pad, via-in-pad — real PCB rules.</p>
      </div>
      {err && <div className="mb-4 bg-red-950 border border-red-800 text-red-300 p-3 rounded-lg text-sm">{err}</div>}

      <div className="flex gap-2 mb-4">
        <select value={bomId || ''} onChange={e => loadReport(parseInt(e.target.value, 10))}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
          <option value="">Select BOM</option>
          {boms.map(b => <option key={b.id} value={b.id}>{b.product_name} {b.revision}</option>)}
        </select>
        {bomId && <button onClick={runChecks} className="flex items-center gap-1 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-sm"><Play className="w-4 h-4" /> Run rule pass</button>}
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-5 bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="text-gray-400 text-xs uppercase tracking-wider mb-3">Measurements (synthetic input)</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="text-gray-400">Acute angle deg
              <input type="number" value={measure.acute_angle_deg} onChange={e => setM('acute_angle_deg', parseFloat(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs mt-1" /></label>
            <label className="text-gray-400">BGA pitch mm
              <input type="number" step="0.01" value={measure.bga_pitch_mm} onChange={e => setM('bga_pitch_mm', parseFloat(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs mt-1" /></label>
            <label className="text-gray-400">Layer count
              <input type="number" value={measure.layers} onChange={e => setM('layers', parseInt(e.target.value, 10))} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs mt-1" /></label>
            <label className="text-gray-400 flex items-center gap-1 mt-4">
              <input type="checkbox" checked={measure.via_in_pad} onChange={e => setM('via_in_pad', e.target.checked)} />
              Via-in-pad?</label>
            <label className="text-gray-400">Pour-to-edge mm
              <input type="number" step="0.01" value={measure.pour_to_edge_mm} onChange={e => setM('pour_to_edge_mm', parseFloat(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs mt-1" /></label>
            <label className="text-gray-400">FPC bend radius mm
              <input type="number" step="0.1" value={measure.flex_bend_radius_mm} onChange={e => setM('flex_bend_radius_mm', parseFloat(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs mt-1" /></label>
            <label className="text-gray-400">FPC thickness mm
              <input type="number" step="0.01" value={measure.flex_thickness_mm} onChange={e => setM('flex_thickness_mm', parseFloat(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs mt-1" /></label>
            <label className="text-gray-400">Trace-to-edge mm
              <input type="number" step="0.01" value={measure.trace_to_edge_mm} onChange={e => setM('trace_to_edge_mm', parseFloat(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs mt-1" /></label>
            <label className="text-gray-400 flex items-center gap-1 mt-4">
              <input type="checkbox" checked={measure.silk_overlaps_pad} onChange={e => setM('silk_overlaps_pad', e.target.checked)} />
              Silk overlaps pad?</label>
          </div>

          <div className="mt-4 bg-gray-800 rounded-lg p-3">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-1"><Shield className="w-3 h-3" />Rule specs</div>
            <div className="text-xs space-y-1">
              {Object.entries(rules).map(([k, v]: any) => (
                <div key={k} className="text-gray-400"><span className="font-mono text-orange-400">{k}</span> — {v.description}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-7 space-y-3">
          {report && (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-3"><div className="text-xs text-gray-500">Total</div><div className="text-white font-bold text-lg">{report.counts.total}</div></div>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-3"><div className="text-xs text-gray-500">Fail</div><div className="text-red-400 font-bold text-lg">{report.counts.fail || 0}</div></div>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-3"><div className="text-xs text-gray-500">Open</div><div className="text-orange-400 font-bold text-lg">{report.counts.open || 0}</div></div>
              </div>
              <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-xs">
                  <thead><tr className="text-gray-500 border-b border-gray-800">
                    <th className="px-3 py-2 text-left">Rule</th><th className="px-3 py-2 text-left">Sev</th>
                    <th className="px-3 py-2 text-left">Location</th><th className="px-3 py-2 text-left">Measured</th>
                    <th className="px-3 py-2 text-left">Spec</th><th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Actions</th>
                  </tr></thead>
                  <tbody>
                    {report.items.map((c: Check) => (
                      <tr key={c.id} className="border-t border-gray-800">
                        <td className="px-3 py-2 font-mono text-orange-400">{c.rule_code}</td>
                        <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded text-xs ${SEV_COLOR[c.severity]}`}>{c.severity}</span></td>
                        <td className="px-3 py-2 text-gray-400">{c.location}</td>
                        <td className="px-3 py-2 text-gray-300">{c.measured_value}</td>
                        <td className="px-3 py-2 text-gray-400">{c.spec_value}</td>
                        <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLOR[c.status]}`}>{c.status}</span></td>
                        <td className="px-3 py-2">
                          {c.status === 'open' && <div className="flex gap-1">
                            <button onClick={() => resolve(c.id)} className="bg-green-700 hover:bg-green-600 text-white px-2 py-0.5 rounded text-xs">Fix</button>
                            <button onClick={() => waive(c.id)} className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-0.5 rounded text-xs">Waive</button>
                          </div>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
