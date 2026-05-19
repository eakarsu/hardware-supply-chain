import { useEffect, useState } from 'react';
import { Layers, RefreshCw, DollarSign, AlertTriangle, Copy } from 'lucide-react';

interface BomHeader { id: number; product_name: string; revision: string; status: string; target_qty: number; owner: string; notes?: string; line_count: number; distinct_components: number; }
interface BomLine { id: number; ref_designator: string; component_id: number; qty_per_assembly: number; mpn: string; manufacturer: string; component_description: string; package: string; lifecycle: string; last_buy_date?: string; reference_unit_price?: number; alt_mpn_1?: string; alt_mpn_2?: string; cheapest_offering?: { distributor: string; distributor_sku: string; stock: number; price_break_1000: number; lead_time_days: number }; }

const LIFECYCLE_COLOR: Record<string, string> = {
  Active: 'bg-green-900 text-green-300',
  NRND: 'bg-yellow-900 text-yellow-300',
  EOL: 'bg-orange-900 text-orange-300',
  Obsolete: 'bg-red-900 text-red-300',
  Preview: 'bg-blue-900 text-blue-300',
};

async function jget(path: string) {
  const t = localStorage.getItem('token') || '';
  const r = await fetch(`/api${path}`, { headers: { Authorization: `Bearer ${t}` } });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.statusText);
  return r.json();
}
async function jpost(path: string, body: any) {
  const t = localStorage.getItem('token') || '';
  const r = await fetch(`/api${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.statusText);
  return r.json();
}

export default function BomPage() {
  const [headers, setHeaders] = useState<BomHeader[]>([]);
  const [selected, setSelected] = useState<BomHeader | null>(null);
  const [detail, setDetail] = useState<{ lines: BomLine[] } | null>(null);
  const [rollup, setRollup] = useState<any>(null);
  const [lifecycleReport, setLifecycleReport] = useState<any>(null);
  const [buildQty, setBuildQty] = useState(1000);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [newRev, setNewRev] = useState('');

  async function loadHeaders() {
    try { setHeaders(await jget('/bom')); } catch (e: any) { setErr(e.message); }
  }
  useEffect(() => { loadHeaders(); }, []);

  async function pick(h: BomHeader) {
    setSelected(h); setDetail(null); setRollup(null); setLifecycleReport(null); setErr('');
    try {
      const d = await jget(`/bom/${h.id}`);
      setDetail(d);
      setBuildQty(h.target_qty || 1000);
    } catch (e: any) { setErr(e.message); }
  }

  async function rollupCost() {
    if (!selected) return;
    setBusy(true); setErr('');
    try { setRollup(await jget(`/bom/${selected.id}/cost-rollup?qty=${buildQty}`)); }
    catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }
  async function loadLifecycle() {
    if (!selected) return;
    setBusy(true); setErr('');
    try { setLifecycleReport(await jget(`/bom/${selected.id}/lifecycle-report`)); }
    catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }
  async function clone() {
    if (!selected || !newRev) return;
    try { await jpost(`/bom/${selected.id}/clone?revision=${encodeURIComponent(newRev)}`, {}); setNewRev(''); loadHeaders(); }
    catch (e: any) { setErr(e.message); }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Layers className="w-6 h-6 text-orange-500" /> BOM Management</h1>
          <p className="text-gray-400 text-sm mt-1">{headers.length} BOMs | real MPNs (TI / ST / Murata / TDK / Vishay / Nordic / Espressif)</p>
        </div>
        <button onClick={loadHeaders} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm"><RefreshCw className="w-4 h-4" /> Refresh</button>
      </div>

      {err && <div className="mb-4 bg-red-950 border border-red-800 text-red-300 p-3 rounded-lg text-sm">{err}</div>}

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">BOM Headers</div>
          {headers.map(h => (
            <div key={h.id} onClick={() => pick(h)}
              className={`p-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800/60 ${selected?.id === h.id ? 'bg-gray-800/80' : ''}`}>
              <div className="text-white text-sm font-medium">{h.product_name}</div>
              <div className="text-gray-500 text-xs">Rev {h.revision} | {h.status} | qty {h.target_qty}</div>
              <div className="text-gray-600 text-xs mt-1">{h.line_count} lines | {h.distinct_components} components</div>
            </div>
          ))}
        </div>

        <div className="col-span-8 space-y-4">
          {selected && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div>
                  <div className="text-white font-semibold">{selected.product_name} <span className="text-gray-500 text-sm">Rev {selected.revision}</span></div>
                  <div className="text-gray-500 text-xs">Owner: {selected.owner || 'n/a'}</div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <input type="number" value={buildQty} onChange={e => setBuildQty(parseInt(e.target.value || '1', 10))}
                    className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white text-sm" />
                  <button onClick={rollupCost} disabled={busy}
                    className="flex items-center gap-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs"><DollarSign className="w-3 h-3" />Roll-up cost</button>
                  <button onClick={loadLifecycle} disabled={busy}
                    className="flex items-center gap-1 bg-yellow-700 hover:bg-yellow-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs"><AlertTriangle className="w-3 h-3" />Lifecycle</button>
                  <input value={newRev} onChange={e => setNewRev(e.target.value)} placeholder="new rev"
                    className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white text-xs" />
                  <button onClick={clone} disabled={!newRev}
                    className="flex items-center gap-1 bg-violet-700 hover:bg-violet-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs"><Copy className="w-3 h-3" />Clone</button>
                </div>
              </div>
            </div>
          )}

          {detail && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="px-4 py-2 border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">Lines</div>
              <table className="w-full text-sm">
                <thead><tr className="text-gray-500 text-xs">
                  <th className="px-3 py-2 text-left">RefDes</th><th className="px-3 py-2 text-left">MPN</th>
                  <th className="px-3 py-2 text-left">Mfr</th><th className="px-3 py-2 text-left">Pkg</th>
                  <th className="px-3 py-2 text-right">Qty</th><th className="px-3 py-2 text-left">Lifecycle</th>
                  <th className="px-3 py-2 text-left">Cheapest</th>
                </tr></thead>
                <tbody>
                  {detail.lines.map(l => (
                    <tr key={l.id} className="border-t border-gray-800">
                      <td className="px-3 py-2 text-gray-300">{l.ref_designator}</td>
                      <td className="px-3 py-2 text-white font-mono text-xs">{l.mpn}</td>
                      <td className="px-3 py-2 text-gray-400 text-xs">{l.manufacturer}</td>
                      <td className="px-3 py-2 text-gray-400 text-xs">{l.package}</td>
                      <td className="px-3 py-2 text-gray-300 text-right">{l.qty_per_assembly}</td>
                      <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded text-xs ${LIFECYCLE_COLOR[l.lifecycle] || 'bg-gray-700 text-gray-300'}`}>{l.lifecycle}</span></td>
                      <td className="px-3 py-2 text-gray-400 text-xs">
                        {l.cheapest_offering ? `${l.cheapest_offering.distributor} @ $${l.cheapest_offering.price_break_1000?.toFixed(4)} (${l.cheapest_offering.stock} stk)` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {rollup && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-800 rounded-lg p-3"><div className="text-xs text-gray-500">Cost / unit</div><div className="text-white font-bold text-lg">${rollup.cost_per_unit?.toFixed(4)}</div></div>
                <div className="bg-gray-800 rounded-lg p-3"><div className="text-xs text-gray-500">Extended total</div><div className="text-white font-bold text-lg">${rollup.total_extended?.toLocaleString()}</div></div>
                <div className="bg-gray-800 rounded-lg p-3"><div className="text-xs text-gray-500">Unsourced lines</div><div className={`font-bold text-lg ${rollup.unsourced_lines ? 'text-yellow-400' : 'text-green-400'}`}>{rollup.unsourced_lines}</div></div>
              </div>
            </div>
          )}

          {lifecycleReport && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">Lifecycle Buckets</div>
              <div className="flex gap-2 flex-wrap mb-3">
                {Object.entries(lifecycleReport.counts).map(([k, v]: any) => (
                  <span key={k} className={`px-2 py-1 rounded text-xs ${LIFECYCLE_COLOR[k] || 'bg-gray-700 text-gray-300'}`}>{k}: {v}</span>
                ))}
              </div>
              {lifecycleReport.at_risk?.length > 0 && (
                <div>
                  <div className="text-yellow-400 text-xs font-semibold mb-1">At-risk lines ({lifecycleReport.at_risk.length})</div>
                  {lifecycleReport.at_risk.map((r: any) => (
                    <div key={r.line_id} className="text-xs text-gray-300 py-1 border-b border-gray-800">
                      <span className="font-mono">{r.mpn}</span> ({r.manufacturer}) — {r.lifecycle}
                      {r.last_buy_date && <span className="text-gray-500"> | last-buy {r.last_buy_date.split('T')[0]}</span>}
                      {r.recommended_alts?.length > 0 && <span className="text-green-400"> | alts: {r.recommended_alts.join(', ')}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
