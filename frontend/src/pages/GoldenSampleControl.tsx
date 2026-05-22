import { useEffect, useState } from 'react';
import { apiFetch } from '../api';

type Row = { id: number; part: string; supplier: string; sample: string; revision: string; inspection: string; status: string };
const empty = { part: '', supplier: '', sample: '', revision: '', inspection: '', status: 'review' };

export default function GoldenSampleControl() {
  const [rows, setRows] = useState<Row[]>([]);
  const [summary, setSummary] = useState({ total: 0, locked: 0, review: 0 });
  const [form, setForm] = useState(empty);
  async function load() {
    const data = await apiFetch('/golden-sample-control');
    setRows(data.samples || []);
    setSummary(data.summary || { total: 0, locked: 0, review: 0 });
  }
  useEffect(() => { load(); }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await apiFetch('/golden-sample-control', { method: 'POST', body: JSON.stringify(form) });
    setForm(empty);
    load();
  }
  return <div className="p-6 text-gray-100">
    <h1 className="text-2xl font-bold mb-2">Golden Sample Control</h1>
    <p className="text-gray-400 mb-6">Approved physical samples by part, supplier, revision, and inspection status.</p>
    <div className="grid grid-cols-3 gap-4 mb-6">{['total','locked','review'].map(k => <div key={k} className="bg-gray-900 border border-gray-800 rounded-lg p-4"><div className="text-gray-500 text-sm">{k}</div><div className="text-2xl font-bold">{summary[k as keyof typeof summary]}</div></div>)}</div>
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
      {['part','supplier','sample','revision','inspection'].map(f => <input key={f} className="bg-gray-950 border border-gray-700 rounded p-2" placeholder={f} value={(form as any)[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} />)}
      <select className="bg-gray-950 border border-gray-700 rounded p-2" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option>review</option><option>locked</option><option>obsolete</option></select>
      <button className="bg-orange-600 rounded px-4 py-2">Add Sample</button>
    </form>
    <table className="w-full bg-gray-900 border border-gray-800"><thead><tr>{['Part','Supplier','Sample','Revision','Inspection','Status'].map(h => <th key={h} className="p-3 text-left">{h}</th>)}</tr></thead><tbody>{rows.map(r => <tr key={r.id} className="border-t border-gray-800"><td className="p-3">{r.part}</td><td>{r.supplier}</td><td>{r.sample}</td><td>{r.revision}</td><td>{r.inspection}</td><td>{r.status}</td></tr>)}</tbody></table>
  </div>;
}
