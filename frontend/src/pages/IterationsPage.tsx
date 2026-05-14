import { useEffect, useState } from 'react';
import { api } from '../api';
import { Iteration, Part } from '../types';
import { Plus, Search, GitBranch, CheckCircle, XCircle, Clock, X, Edit2, Trash2 } from 'lucide-react';

function IterationForm({ iteration, parts, onSave, onClose }: { iteration?: Iteration | null; parts: Part[]; onSave: () => void; onClose: () => void }) {
  const [form, setForm] = useState({
    part_id: iteration?.part_id || '',
    version: iteration?.version || '',
    changes: iteration?.changes || '',
    engineer: iteration?.engineer || '',
    started_at: iteration?.started_at?.slice(0, 16) || '',
    completed_at: iteration?.completed_at?.slice(0, 16) || '',
    success: iteration?.success !== false,
    iteration_hours: iteration?.iteration_hours || '',
    cad_file_url: iteration?.cad_file_url || '',
    notes: iteration?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, completed_at: form.completed_at || null };
    try {
      if (iteration) await api.updateIteration(iteration.id, data);
      else await api.createIteration(data);
      onSave();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-white font-semibold">{iteration ? 'Edit Iteration' : 'New Iteration'}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Part *</label>
              <select required value={form.part_id} onChange={e => setForm({ ...form, part_id: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500">
                <option value="">Select part...</option>
                {parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Version *</label>
              <input required value={form.version} onChange={e => setForm({ ...form, version: e.target.value })}
                placeholder="v1.0"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Engineer</label>
              <input value={form.engineer} onChange={e => setForm({ ...form, engineer: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Started At</label>
              <input type="datetime-local" value={form.started_at} onChange={e => setForm({ ...form, started_at: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Completed At</label>
              <input type="datetime-local" value={form.completed_at} onChange={e => setForm({ ...form, completed_at: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Hours</label>
              <input type="number" step="0.5" value={form.iteration_hours} onChange={e => setForm({ ...form, iteration_hours: parseFloat(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input type="checkbox" id="success" checked={form.success} onChange={e => setForm({ ...form, success: e.target.checked })}
                className="rounded bg-gray-800 border-gray-700" />
              <label htmlFor="success" className="text-sm text-gray-300">Successful</label>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Changes</label>
              <textarea rows={2} value={form.changes} onChange={e => setForm({ ...form, changes: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">CAD File URL</label>
              <input value={form.cad_file_url} onChange={e => setForm({ ...form, cad_file_url: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Notes</label>
              <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg text-sm font-medium">Save</button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function IterationsPage() {
  const [iterations, setIterations] = useState<Iteration[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Iteration | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editIter, setEditIter] = useState<Iteration | null>(null);

  const load = async () => {
    const [i, p] = await Promise.all([api.getIterations(), api.getParts()]);
    setIterations(i); setParts(p);
  };
  useEffect(() => { load(); }, []);

  const filtered = iterations.filter(i =>
    i.part_name?.toLowerCase().includes(search.toLowerCase()) ||
    i.version?.toLowerCase().includes(search.toLowerCase()) ||
    i.engineer?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this iteration?')) return;
    await api.deleteIteration(id);
    setSelected(null);
    load();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Design Iterations</h1>
          <p className="text-gray-400 text-sm mt-1">{iterations.length} iterations | {iterations.filter(i => i.success).length} successful</p>
        </div>
        <button onClick={() => { setEditIter(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" /> New Iteration
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search iterations..."
          className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500" />
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filtered.map(iter => (
          <div key={iter.id} onClick={() => setSelected(iter)}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-orange-600 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iter.success ? 'bg-green-900' : 'bg-red-900'}`}>
                  {iter.success ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium">{iter.part_name}</p>
                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded font-mono">{iter.version}</span>
                  </div>
                  <p className="text-gray-500 text-xs">{iter.engineer} · {iter.started_at?.split('T')[0]}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-gray-400 text-sm">
                  <Clock className="w-3 h-3" />
                  <span>{iter.iteration_hours}h</span>
                </div>
                {!iter.completed_at && <span className="text-xs text-yellow-400">In Progress</span>}
              </div>
            </div>
            {iter.changes && (
              <p className="text-gray-400 text-xs mt-2 truncate">{iter.changes}</p>
            )}
          </div>
        ))}
      </div>

      {selected && !showForm && (
        <div className="fixed inset-y-0 right-0 w-1/2 bg-gray-900 border-l border-gray-800 z-40 overflow-y-auto">
          <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-white font-semibold text-lg">{selected.part_name} — {selected.version}</h2>
              <p className="text-gray-400 text-sm">{selected.engineer}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setEditIter(selected); setShowForm(true); }} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(selected.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              <button onClick={() => setSelected(null)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              {selected.success ? (
                <span className="flex items-center gap-1 text-green-400 text-sm"><CheckCircle className="w-4 h-4" /> Successful</span>
              ) : (
                <span className="flex items-center gap-1 text-red-400 text-sm"><XCircle className="w-4 h-4" /> Failed</span>
              )}
              <span className="text-gray-400 text-sm">{selected.iteration_hours}h</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Started', selected.started_at?.split('T')[0]],
                ['Completed', selected.completed_at?.split('T')[0] || 'In Progress'],
                ['Hours', `${selected.iteration_hours}h`],
                ['Part', selected.part_name],
              ].map(([label, value]) => (
                <div key={String(label)} className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-500 text-xs">{label}</p>
                  <p className="text-white font-medium mt-1 text-sm">{value || '—'}</p>
                </div>
              ))}
            </div>
            {selected.changes && (
              <div>
                <p className="text-gray-500 text-xs mb-1">Changes</p>
                <p className="text-gray-300 text-sm">{selected.changes}</p>
              </div>
            )}
            {selected.notes && (
              <div>
                <p className="text-gray-500 text-xs mb-1">Notes</p>
                <p className="text-gray-300 text-sm">{selected.notes}</p>
              </div>
            )}
            {selected.cad_file_url && (
              <div>
                <p className="text-gray-500 text-xs mb-1">CAD File</p>
                <a href={selected.cad_file_url} target="_blank" rel="noopener noreferrer" className="text-orange-400 text-sm hover:underline">{selected.cad_file_url}</a>
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <IterationForm iteration={editIter} parts={parts}
          onClose={() => { setShowForm(false); setEditIter(null); }}
          onSave={() => { setShowForm(false); setEditIter(null); setSelected(null); load(); }} />
      )}
    </div>
  );
}
