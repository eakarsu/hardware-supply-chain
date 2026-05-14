import { useEffect, useState } from 'react';
import { DollarSign, Globe, Calculator } from 'lucide-react';

interface Scenario { id: number; bom_id: number; origin_country: string; destination_country: string; incoterm: string; fob_total_usd: number; duty_pct: number; freight_usd: number; insurance_usd: number; brokerage_usd: number; carrying_pct_per_year: number; days_in_inventory: number; lot_qty: number; computed_landed_per_unit: number; product_name?: string; revision?: string; delta_vs_cheapest_usd_per_unit?: number; delta_vs_cheapest_pct?: number; }
interface BomHeader { id: number; product_name: string; revision: string; }

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

const COUNTRIES = ['China', 'Vietnam', 'Mexico', 'USA', 'Taiwan', 'South Korea', 'Japan', 'Germany', 'India'];
const INCOTERMS = ['FOB', 'EXW', 'CIF', 'DDP'];

export default function LandedCostPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [boms, setBoms] = useState<BomHeader[]>([]);
  const [, setSelectedBom] = useState<number | null>(null);
  const [compare, setCompare] = useState<any>(null);
  const [preview, setPreview] = useState<any>(null);
  const [err, setErr] = useState('');

  const [form, setForm] = useState<any>({
    bom_id: '', origin_country: 'China', destination_country: 'USA', incoterm: 'FOB',
    fob_total_usd: 18500, duty_pct: 25, freight_usd: 2100, insurance_usd: 80, brokerage_usd: 150,
    carrying_pct_per_year: 0.18, days_in_inventory: 60, lot_qty: 5000, hts_heading: '8542 (ICs)',
  });

  async function load() {
    setErr('');
    try {
      setScenarios(await jget('/landed-cost'));
      setBoms(await jget('/bom'));
    } catch (e: any) { setErr(e.message); }
  }
  useEffect(() => { load(); }, []);

  async function loadCompare(bomId: number) {
    setSelectedBom(bomId);
    try { setCompare(await jget(`/landed-cost/compare/${bomId}`)); }
    catch (e: any) { setErr(e.message); }
  }

  async function previewCost() {
    setErr('');
    try { setPreview(await jpost('/landed-cost/preview', form)); }
    catch (e: any) { setErr(e.message); }
  }

  async function saveScenario() {
    setErr('');
    try { await jpost('/landed-cost', form); load(); }
    catch (e: any) { setErr(e.message); }
  }

  function setF(k: string, v: any) { setForm({ ...form, [k]: v }); }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><DollarSign className="w-6 h-6 text-orange-500" /> Landed Cost</h1>
        <p className="text-gray-400 text-sm mt-1">FOB + Duty (Section 301) + Freight + Insurance + Brokerage + Carrying. USMCA / KORUS / USJTA aware.</p>
      </div>

      {err && <div className="mb-4 bg-red-950 border border-red-800 text-red-300 p-3 rounded-lg text-sm">{err}</div>}

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-5 bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="text-gray-400 text-xs uppercase tracking-wider mb-3 flex items-center gap-2"><Calculator className="w-4 h-4" /> Scenario Builder</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="text-gray-400">BOM
              <select value={form.bom_id} onChange={e => setF('bom_id', parseInt(e.target.value || '0', 10))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs mt-1">
                <option value="">--</option>
                {boms.map(b => <option key={b.id} value={b.id}>{b.product_name} {b.revision}</option>)}
              </select>
            </label>
            <label className="text-gray-400">Origin
              <select value={form.origin_country} onChange={e => setF('origin_country', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs mt-1">
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="text-gray-400">Destination
              <select value={form.destination_country} onChange={e => setF('destination_country', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs mt-1">
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="text-gray-400">Incoterm
              <select value={form.incoterm} onChange={e => setF('incoterm', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs mt-1">
                {INCOTERMS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </label>
            <label className="text-gray-400">HTS heading
              <input value={form.hts_heading} onChange={e => setF('hts_heading', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs mt-1" />
            </label>
            <label className="text-gray-400">Duty % (override)
              <input type="number" value={form.duty_pct} onChange={e => setF('duty_pct', parseFloat(e.target.value || '0'))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs mt-1" />
            </label>
            <label className="text-gray-400">FOB total $
              <input type="number" value={form.fob_total_usd} onChange={e => setF('fob_total_usd', parseFloat(e.target.value || '0'))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs mt-1" />
            </label>
            <label className="text-gray-400">Freight $
              <input type="number" value={form.freight_usd} onChange={e => setF('freight_usd', parseFloat(e.target.value || '0'))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs mt-1" />
            </label>
            <label className="text-gray-400">Insurance $
              <input type="number" value={form.insurance_usd} onChange={e => setF('insurance_usd', parseFloat(e.target.value || '0'))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs mt-1" />
            </label>
            <label className="text-gray-400">Brokerage $
              <input type="number" value={form.brokerage_usd} onChange={e => setF('brokerage_usd', parseFloat(e.target.value || '0'))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs mt-1" />
            </label>
            <label className="text-gray-400">Carrying %/yr
              <input type="number" step="0.01" value={form.carrying_pct_per_year} onChange={e => setF('carrying_pct_per_year', parseFloat(e.target.value || '0'))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs mt-1" />
            </label>
            <label className="text-gray-400">Days inv
              <input type="number" value={form.days_in_inventory} onChange={e => setF('days_in_inventory', parseInt(e.target.value || '0', 10))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs mt-1" />
            </label>
            <label className="text-gray-400">Lot qty
              <input type="number" value={form.lot_qty} onChange={e => setF('lot_qty', parseInt(e.target.value || '1', 10))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs mt-1" />
            </label>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={previewCost} className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded text-xs">Preview</button>
            <button onClick={saveScenario} disabled={!form.bom_id} className="bg-violet-700 hover:bg-violet-600 disabled:opacity-50 text-white px-3 py-1.5 rounded text-xs">Save scenario</button>
          </div>
          {preview && (
            <div className="mt-3 bg-gray-800 rounded-lg p-3 text-xs space-y-1">
              <div className="flex justify-between"><span className="text-gray-400">Duty applied</span><span className="text-white">{preview.duty_pct_applied}% {preview.fta_applied ? `(FTA: ${preview.fta_applied})` : ''}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Duty $</span><span className="text-white">${preview.duty_value_usd}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">CIF + duty</span><span className="text-white">${preview.cif_plus_duty_usd}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Carrying $</span><span className="text-white">${preview.carrying_cost_usd}</span></div>
              <div className="flex justify-between border-t border-gray-700 pt-1 mt-1"><span className="text-gray-400">Landed total</span><span className="text-orange-400 font-bold">${preview.total_landed_usd}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Per unit</span><span className="text-orange-400 font-bold">${preview.landed_per_unit_usd}</span></div>
            </div>
          )}
        </div>

        <div className="col-span-7 space-y-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider flex items-center gap-2"><Globe className="w-4 h-4" />Saved Scenarios</div>
            <table className="w-full text-xs">
              <thead><tr className="text-gray-500"><th className="px-3 py-2 text-left">BOM</th><th className="px-3 py-2 text-left">Lane</th><th className="px-3 py-2 text-right">Duty%</th><th className="px-3 py-2 text-right">Lot</th><th className="px-3 py-2 text-right">$/unit</th></tr></thead>
              <tbody>
                {scenarios.map(s => (
                  <tr key={s.id} onClick={() => loadCompare(s.bom_id)} className="border-t border-gray-800 cursor-pointer hover:bg-gray-800/60">
                    <td className="px-3 py-2 text-white">{s.product_name || s.bom_id} <span className="text-gray-500">{s.revision}</span></td>
                    <td className="px-3 py-2 text-gray-300">{s.origin_country} → {s.destination_country} ({s.incoterm})</td>
                    <td className="px-3 py-2 text-right text-gray-300">{Number(s.duty_pct).toFixed(1)}%</td>
                    <td className="px-3 py-2 text-right text-gray-300">{s.lot_qty}</td>
                    <td className="px-3 py-2 text-right text-orange-400 font-medium">${Number(s.computed_landed_per_unit).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {compare && compare.scenarios?.length > 0 && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">Compare BOM #{compare.bom_id}</div>
              {compare.scenarios.map((s: any) => (
                <div key={s.id} className={`flex items-center gap-2 text-xs py-1 border-b border-gray-800 ${s.id === compare.cheapest_id ? 'text-green-400 font-medium' : 'text-gray-300'}`}>
                  <span className="w-40">{s.origin_country} → {s.destination_country}</span>
                  <span className="w-12">{s.incoterm}</span>
                  <span className="ml-auto">${Number(s.computed_landed_per_unit).toFixed(2)}/u</span>
                  <span className="w-16 text-right">{s.id === compare.cheapest_id ? 'cheapest' : `+$${Number(s.delta_vs_cheapest_usd_per_unit).toFixed(2)}`}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
