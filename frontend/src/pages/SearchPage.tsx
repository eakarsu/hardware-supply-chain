import { useState } from 'react';
import { api } from '../api';
import { Search as SearchIcon, Package, Truck, ShoppingCart, Factory, GitBranch, CheckSquare } from 'lucide-react';

interface SearchResults {
  parts?: Array<{ id: number; name: string; part_number: string; category: string; status: string; unit_cost: number }>;
  suppliers?: Array<{ id: number; name: string; country: string; city: string; reliability_score: number }>;
  orders?: Array<{ id: number; part_name: string; supplier_name: string; quantity: number; status: string; total_cost: number }>;
  manufacturers?: Array<{ id: number; name: string; country: string; specialization: string; rating: number }>;
  iterations?: Array<{ id: number; part_name: string; version: string; engineer: string; success: boolean }>;
  quality?: Array<{ id: number; part_name: string; inspector: string; pass: boolean; defect_rate: number }>;
  totals?: Record<string, number>;
}

const ENTITIES = ['all', 'parts', 'suppliers', 'orders', 'manufacturers', 'iterations', 'quality'];
const STATUSES = ['', 'active', 'discontinued', 'prototype', 'on_order', 'pending', 'confirmed', 'in_production', 'shipped', 'received'];
const CATEGORIES = ['', 'mechanical', 'electronic', 'pneumatic', 'structural', 'optical', 'fastener'];

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [entity, setEntity] = useState('all');
  const [country, setCountry] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [minCost, setMinCost] = useState('');
  const [maxCost, setMaxCost] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const search = async () => {
    setLoading(true); setErr('');
    try {
      const params: Record<string, string> = { q, entity };
      if (country) params.country = country;
      if (status) params.status = status;
      if (category) params.category = category;
      if (minCost) params.min_cost = minCost;
      if (maxCost) params.max_cost = maxCost;
      const r = await api.search(params);
      setResults(r);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <SearchIcon className="w-6 h-6 text-orange-500" />
        <div>
          <h1 className="text-2xl font-bold text-white">Advanced Search & Filter</h1>
          <p className="text-gray-400 text-sm">Search across parts, suppliers, orders, manufacturers, iterations and QC records.</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-400 mb-1">Search term</label>
            <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') search(); }}
              placeholder="name, part number, notes, certifications..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Entity</label>
            <select value={entity} onChange={e => setEntity(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500">
              {ENTITIES.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Country</label>
            <input value={country} onChange={e => setCountry(e.target.value)} placeholder="USA, China, Germany..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500">
              {STATUSES.map(s => <option key={s} value={s}>{s || 'any'}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500">
              {CATEGORIES.map(c => <option key={c} value={c}>{c || 'any'}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Min cost</label>
            <input type="number" value={minCost} onChange={e => setMinCost(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Max cost</label>
            <input type="number" value={maxCost} onChange={e => setMaxCost(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={search} disabled={loading}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
            <SearchIcon className="w-4 h-4" /> {loading ? 'Searching...' : 'Search'}
          </button>
          {err && <span className="text-red-400 text-sm self-center">{err}</span>}
          {results?.totals && (
            <span className="text-gray-400 text-sm self-center">
              Found: {Object.entries(results.totals).map(([k, v]) => `${k}=${v}`).join(', ')}
            </span>
          )}
        </div>
      </div>

      {results && (
        <div className="space-y-6">
          {results.parts && results.parts.length > 0 && (
            <ResultBlock icon={<Package className="w-4 h-4 text-orange-500" />} label={`Parts (${results.parts.length})`}>
              <table className="w-full text-sm">
                <thead><tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
                  <th className="text-left p-2">Name</th><th className="text-left p-2">Part #</th><th className="text-left p-2">Category</th><th className="text-left p-2">Status</th><th className="text-left p-2">Unit Cost</th>
                </tr></thead>
                <tbody>{results.parts.map(p => (
                  <tr key={p.id} className="border-b border-gray-800/50 text-gray-300">
                    <td className="p-2">{p.name}</td><td className="p-2 text-gray-500">{p.part_number}</td>
                    <td className="p-2">{p.category}</td><td className="p-2">{p.status}</td>
                    <td className="p-2">${Number(p.unit_cost).toFixed(2)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </ResultBlock>
          )}
          {results.suppliers && results.suppliers.length > 0 && (
            <ResultBlock icon={<Truck className="w-4 h-4 text-blue-400" />} label={`Suppliers (${results.suppliers.length})`}>
              <table className="w-full text-sm">
                <thead><tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
                  <th className="text-left p-2">Name</th><th className="text-left p-2">Country</th><th className="text-left p-2">City</th><th className="text-left p-2">Reliability</th>
                </tr></thead>
                <tbody>{results.suppliers.map(s => (
                  <tr key={s.id} className="border-b border-gray-800/50 text-gray-300">
                    <td className="p-2">{s.name}</td><td className="p-2">{s.country}</td><td className="p-2">{s.city}</td><td className="p-2">{s.reliability_score}</td>
                  </tr>
                ))}</tbody>
              </table>
            </ResultBlock>
          )}
          {results.orders && results.orders.length > 0 && (
            <ResultBlock icon={<ShoppingCart className="w-4 h-4 text-green-400" />} label={`Orders (${results.orders.length})`}>
              <table className="w-full text-sm">
                <thead><tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
                  <th className="text-left p-2">Part</th><th className="text-left p-2">Supplier</th><th className="text-left p-2">Qty</th><th className="text-left p-2">Status</th><th className="text-left p-2">Total</th>
                </tr></thead>
                <tbody>{results.orders.map(o => (
                  <tr key={o.id} className="border-b border-gray-800/50 text-gray-300">
                    <td className="p-2">{o.part_name}</td><td className="p-2">{o.supplier_name}</td>
                    <td className="p-2">{o.quantity}</td><td className="p-2">{o.status}</td>
                    <td className="p-2">${Number(o.total_cost).toFixed(2)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </ResultBlock>
          )}
          {results.manufacturers && results.manufacturers.length > 0 && (
            <ResultBlock icon={<Factory className="w-4 h-4 text-purple-400" />} label={`Manufacturers (${results.manufacturers.length})`}>
              <table className="w-full text-sm">
                <thead><tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
                  <th className="text-left p-2">Name</th><th className="text-left p-2">Country</th><th className="text-left p-2">Specialization</th><th className="text-left p-2">Rating</th>
                </tr></thead>
                <tbody>{results.manufacturers.map(m => (
                  <tr key={m.id} className="border-b border-gray-800/50 text-gray-300">
                    <td className="p-2">{m.name}</td><td className="p-2">{m.country}</td><td className="p-2 text-gray-400">{m.specialization}</td><td className="p-2">{m.rating}</td>
                  </tr>
                ))}</tbody>
              </table>
            </ResultBlock>
          )}
          {results.iterations && results.iterations.length > 0 && (
            <ResultBlock icon={<GitBranch className="w-4 h-4 text-cyan-400" />} label={`Iterations (${results.iterations.length})`}>
              <table className="w-full text-sm">
                <thead><tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
                  <th className="text-left p-2">Part</th><th className="text-left p-2">Version</th><th className="text-left p-2">Engineer</th><th className="text-left p-2">Success</th>
                </tr></thead>
                <tbody>{results.iterations.map(i => (
                  <tr key={i.id} className="border-b border-gray-800/50 text-gray-300">
                    <td className="p-2">{i.part_name}</td><td className="p-2">{i.version}</td><td className="p-2">{i.engineer}</td>
                    <td className="p-2">{i.success ? 'yes' : 'no'}</td>
                  </tr>
                ))}</tbody>
              </table>
            </ResultBlock>
          )}
          {results.quality && results.quality.length > 0 && (
            <ResultBlock icon={<CheckSquare className="w-4 h-4 text-yellow-400" />} label={`Quality Checks (${results.quality.length})`}>
              <table className="w-full text-sm">
                <thead><tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
                  <th className="text-left p-2">Part</th><th className="text-left p-2">Inspector</th><th className="text-left p-2">Pass</th><th className="text-left p-2">Defect %</th>
                </tr></thead>
                <tbody>{results.quality.map(q => (
                  <tr key={q.id} className="border-b border-gray-800/50 text-gray-300">
                    <td className="p-2">{q.part_name}</td><td className="p-2">{q.inspector}</td>
                    <td className="p-2">{q.pass ? 'pass' : 'fail'}</td><td className="p-2">{q.defect_rate}</td>
                  </tr>
                ))}</tbody>
              </table>
            </ResultBlock>
          )}
        </div>
      )}
    </div>
  );
}

function ResultBlock({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-3 border-b border-gray-800 flex items-center gap-2">
        {icon}
        <span className="text-white text-sm font-medium">{label}</span>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
