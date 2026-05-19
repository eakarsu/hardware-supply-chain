import { useEffect, useState } from 'react';
import { Cpu, Search, AlertTriangle, ExternalLink } from 'lucide-react';

interface Component { id: number; mpn: string; manufacturer: string; description: string; package: string; category: string; lifecycle: string; last_buy_date?: string; pin_count?: number; pitch_mm?: number; unit_price?: number; total_stock_all_dists?: number; distributor_count?: number; }
interface Offering { id: number; distributor: string; distributor_sku: string; stock: number; factory_stock: number; moq: number; cost_break_1: number; cost_break_100: number; cost_break_1000: number; lead_time_days: number; url?: string; }

const LIFECYCLES = ['Active', 'NRND', 'EOL', 'Obsolete', 'Preview'] as const;
const LC_COLOR: Record<string, string> = {
  Active: 'bg-green-900 text-green-300',
  NRND: 'bg-yellow-900 text-yellow-300',
  EOL: 'bg-orange-900 text-orange-300',
  Obsolete: 'bg-red-900 text-red-300',
  Preview: 'bg-blue-900 text-blue-300',
};

async function jget(p: string) {
  const t = localStorage.getItem('token') || '';
  const r = await fetch(`/api${p}`, { headers: { Authorization: `Bearer ${t}` } });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.statusText);
  return r.json();
}

export default function ComponentsPage() {
  const [comps, setComps] = useState<Component[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Component | null>(null);
  const [offers, setOffers] = useState<Offering[]>([]);
  const [eolWatch, setEolWatch] = useState<any>(null);
  const [qty, setQty] = useState(1000);
  const [cheapest, setCheapest] = useState<any>(null);
  const [err, setErr] = useState('');

  async function load() {
    setErr('');
    try {
      if (filter === 'all') setComps(await jget('/components'));
      else setComps(await jget(`/components/lifecycle/${filter}`));
    } catch (e: any) { setErr(e.message); }
  }
  useEffect(() => { load(); }, [filter]);

  async function runSearch() {
    if (!search.trim()) return load();
    setErr('');
    try { setComps(await jget(`/components/search?q=${encodeURIComponent(search)}`)); }
    catch (e: any) { setErr(e.message); }
  }

  async function pick(c: Component) {
    setSelected(c); setCheapest(null);
    try {
      const d = await jget(`/components/${c.id}`);
      setOffers(d.offerings || []);
    } catch (e: any) { setErr(e.message); }
  }

  async function loadCheapest() {
    if (!selected) return;
    try { setCheapest(await jget(`/components/${selected.id}/cheapest?qty=${qty}`)); }
    catch (e: any) { setErr(e.message); }
  }

  async function loadEolWatch() {
    try { setEolWatch(await jget('/components/eol-watch?days=365')); }
    catch (e: any) { setErr(e.message); }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Cpu className="w-6 h-6 text-orange-500" /> Component Catalog</h1>
          <p className="text-gray-400 text-sm mt-1">{comps.length} components | Digi-Key, Mouser, Arrow, Avnet, LCSC distributor offerings</p>
        </div>
        <button onClick={loadEolWatch} className="flex items-center gap-2 bg-yellow-700 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm"><AlertTriangle className="w-4 h-4" />EOL Watch</button>
      </div>

      {err && <div className="mb-4 bg-red-950 border border-red-800 text-red-300 p-3 rounded-lg text-sm">{err}</div>}

      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="flex gap-1">
          {(['all', ...LIFECYCLES]).map(l => (
            <button key={l} onClick={() => setFilter(l)}
              className={`px-3 py-1.5 rounded-lg text-xs ${filter === l ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>{l}</button>
          ))}
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') runSearch(); }}
            placeholder="Search MPN / manufacturer..."
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
        </div>
      </div>

      {eolWatch && (
        <div className="mb-4 bg-yellow-950/40 border border-yellow-800 rounded-lg p-3">
          <div className="text-yellow-300 text-xs font-semibold mb-2">EOL Watch ({eolWatch.count} items within {eolWatch.horizon_days} days)</div>
          <div className="space-y-1">
            {eolWatch.items.map((x: any) => (
              <div key={x.id} className="text-xs text-gray-300 flex gap-2">
                <span className={`px-1.5 py-0.5 rounded ${LC_COLOR[x.lifecycle]}`}>{x.lifecycle}</span>
                <span className="font-mono">{x.mpn}</span><span className="text-gray-500">{x.manufacturer}</span>
                <span className="text-yellow-400 ml-auto">{x.last_buy_date ? `last-buy ${x.last_buy_date.split('T')[0]}` : 'no date'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-gray-500 text-xs border-b border-gray-800">
              <th className="px-3 py-2 text-left">MPN</th><th className="px-3 py-2 text-left">Mfr</th>
              <th className="px-3 py-2 text-left">Pkg</th><th className="px-3 py-2 text-left">Lifecycle</th>
              <th className="px-3 py-2 text-right">Total Stk</th><th className="px-3 py-2 text-right">Distis</th>
            </tr></thead>
            <tbody>
              {comps.map(c => (
                <tr key={c.id} onClick={() => pick(c)}
                  className={`border-b border-gray-800 cursor-pointer hover:bg-gray-800/60 ${selected?.id === c.id ? 'bg-gray-800/80' : ''}`}>
                  <td className="px-3 py-2 text-white font-mono text-xs">{c.mpn}</td>
                  <td className="px-3 py-2 text-gray-400 text-xs">{c.manufacturer}</td>
                  <td className="px-3 py-2 text-gray-400 text-xs">{c.package}</td>
                  <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded text-xs ${LC_COLOR[c.lifecycle]}`}>{c.lifecycle}</span></td>
                  <td className="px-3 py-2 text-right text-gray-300">{Number(c.total_stock_all_dists || 0).toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-gray-400">{c.distributor_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {comps.length === 0 && <div className="text-center py-12 text-gray-600">No components</div>}
        </div>

        <div className="col-span-5 space-y-3">
          {selected && (
            <>
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                <div className="text-white font-semibold font-mono">{selected.mpn}</div>
                <div className="text-gray-400 text-xs">{selected.manufacturer} | {selected.category}</div>
                <div className="text-gray-300 text-sm mt-2">{selected.description}</div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div><span className="text-gray-500">Package</span> <span className="text-gray-300">{selected.package}</span></div>
                  <div><span className="text-gray-500">Pitch</span> <span className="text-gray-300">{selected.pitch_mm || 'n/a'}mm</span></div>
                  <div><span className="text-gray-500">Pins</span> <span className="text-gray-300">{selected.pin_count || 'n/a'}</span></div>
                  <div><span className="text-gray-500">Lifecycle</span> <span className={`px-1.5 py-0.5 rounded ${LC_COLOR[selected.lifecycle]}`}>{selected.lifecycle}</span></div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-gray-400 text-xs uppercase tracking-wider">Distributor Offerings</div>
                  <input type="number" value={qty} onChange={e => setQty(parseInt(e.target.value || '1', 10))}
                    className="ml-auto w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs" />
                  <button onClick={loadCheapest} className="bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded text-xs">Cheapest@qty</button>
                </div>
                {offers.map(o => (
                  <div key={o.id} className="border-t border-gray-800 py-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{o.distributor}</span>
                      <span className="text-gray-500 font-mono">{o.distributor_sku}</span>
                      {o.url && <a href={o.url} target="_blank" rel="noreferrer" className="ml-auto text-blue-400"><ExternalLink className="w-3 h-3" /></a>}
                    </div>
                    <div className="text-gray-400 mt-1">Stk {o.stock?.toLocaleString()} | MOQ {o.moq} | LT {o.lead_time_days}d</div>
                    <div className="text-gray-300 mt-1">@1: ${Number(o.cost_break_1 || 0).toFixed(4)} | @100: ${Number(o.cost_break_100 || 0).toFixed(4)} | @1k: ${Number(o.cost_break_1000 || 0).toFixed(4)}</div>
                  </div>
                ))}
                {cheapest && (
                  <div className="mt-3 bg-green-950/30 border border-green-800 rounded-lg p-2">
                    <div className="text-green-400 text-xs font-semibold">Cheapest at qty {cheapest.qty}: {cheapest.ranked[0]?.distributor}</div>
                    <div className="text-gray-300 text-xs">${Number(cheapest.ranked[0]?.applied_unit_cost || 0).toFixed(4)}/unit | Ext ${Number(cheapest.ranked[0]?.extended_cost || 0).toFixed(2)}</div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
