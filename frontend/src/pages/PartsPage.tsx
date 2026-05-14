import { useEffect, useState } from 'react';
import { api } from '../api';
import { Part } from '../types';
import { Plus, Search, Package, AlertTriangle, X, Edit2, Trash2 } from 'lucide-react';

const CATEGORIES = ['mechanical', 'electronic', 'pneumatic', 'structural', 'optical', 'fastener'];
const STATUSES = ['active', 'discontinued', 'prototype', 'on_order'];

const statusColors: Record<string, string> = {
  active: 'bg-green-900 text-green-300',
  discontinued: 'bg-gray-700 text-gray-400',
  prototype: 'bg-blue-900 text-blue-300',
  on_order: 'bg-yellow-900 text-yellow-300',
};

function PartForm({ part, parts: _parts, onSave, onClose }: { part?: Part | null; parts?: Part[]; onSave: () => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: part?.name || '', part_number: part?.part_number || '',
    description: part?.description || '', material: part?.material || '',
    category: part?.category || 'mechanical', unit_cost: part?.unit_cost || '',
    weight_grams: part?.weight_grams || '', lead_time_days: part?.lead_time_days || '',
    status: part?.status || 'active', in_stock: part?.in_stock || 0,
    reorder_threshold: part?.reorder_threshold || 10,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (part) await api.updatePart(part.id, form);
      else await api.createPart(form);
      onSave();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-white font-semibold">{part ? 'Edit Part' : 'New Part'}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Part Name *</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Part Number</label>
              <input value={form.part_number} onChange={e => setForm({ ...form, part_number: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Material</label>
              <input value={form.material} onChange={e => setForm({ ...form, material: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Unit Cost ($)</label>
              <input type="number" step="0.01" value={form.unit_cost} onChange={e => setForm({ ...form, unit_cost: parseFloat(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Weight (g)</label>
              <input type="number" step="0.1" value={form.weight_grams} onChange={e => setForm({ ...form, weight_grams: parseFloat(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Lead Time (days)</label>
              <input type="number" value={form.lead_time_days} onChange={e => setForm({ ...form, lead_time_days: parseInt(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">In Stock</label>
              <input type="number" value={form.in_stock} onChange={e => setForm({ ...form, in_stock: parseInt(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Reorder Threshold</label>
              <input type="number" value={form.reorder_threshold} onChange={e => setForm({ ...form, reorder_threshold: parseInt(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Description</label>
              <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg text-sm font-medium">Save Part</button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PartDetail({ part, onEdit, onDelete, onClose }: { part: Part; onEdit: () => void; onDelete: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-y-0 right-0 w-1/2 bg-gray-900 border-l border-gray-800 z-40 overflow-y-auto">
      <div className="p-6 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-lg">{part.name}</h2>
          <p className="text-gray-400 text-sm">{part.part_number}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onEdit} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"><Edit2 className="w-4 h-4" /></button>
          <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg"><Trash2 className="w-4 h-4" /></button>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
      </div>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[part.status] || 'bg-gray-700 text-gray-300'}`}>{part.status}</span>
          <span className="px-2 py-1 rounded text-xs bg-gray-800 text-gray-300">{part.category}</span>
          {part.in_stock <= part.reorder_threshold && (
            <span className="flex items-center gap-1 text-yellow-400 text-xs"><AlertTriangle className="w-3 h-3" />Low Stock</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            ['Unit Cost', `$${Number(part.unit_cost).toFixed(2)}`],
            ['Weight', `${part.weight_grams}g`],
            ['Lead Time', `${part.lead_time_days} days`],
            ['In Stock', part.in_stock],
            ['Reorder At', part.reorder_threshold],
            ['Material', part.material],
          ].map(([label, value]) => (
            <div key={String(label)} className="bg-gray-800 rounded-lg p-3">
              <p className="text-gray-500 text-xs">{label}</p>
              <p className="text-white font-medium mt-1">{value}</p>
            </div>
          ))}
        </div>
        {part.description && (
          <div>
            <p className="text-gray-500 text-xs mb-2">Description</p>
            <p className="text-gray-300 text-sm">{part.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Part | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editPart, setEditPart] = useState<Part | null>(null);

  const load = async () => { setParts(await api.getParts()); };
  useEffect(() => { load(); }, []);

  const filtered = parts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.part_number?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this part?')) return;
    await api.deletePart(id);
    setSelected(null);
    load();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Parts Catalog</h1>
          <p className="text-gray-400 text-sm mt-1">{parts.length} parts | {parts.filter(p => p.in_stock <= p.reorder_threshold).length} need reorder</p>
        </div>
        <button onClick={() => { setEditPart(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" /> New Part
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search parts..."
          className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500" />
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              {['Part', 'Category', 'Material', 'Unit Cost', 'In Stock', 'Lead Time', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} onClick={() => setSelected(p)}
                className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-white text-sm font-medium">{p.name}</p>
                      <p className="text-gray-500 text-xs">{p.part_number}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-300 text-sm capitalize">{p.category}</td>
                <td className="px-4 py-3 text-gray-300 text-sm">{p.material}</td>
                <td className="px-4 py-3 text-gray-300 text-sm">${Number(p.unit_cost).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-medium ${p.in_stock <= p.reorder_threshold ? 'text-yellow-400' : 'text-gray-300'}`}>
                    {p.in_stock}
                    {p.in_stock <= p.reorder_threshold && <AlertTriangle className="w-3 h-3 inline ml-1" />}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300 text-sm">{p.lead_time_days}d</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[p.status] || 'bg-gray-700 text-gray-300'}`}>{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-600">No parts found</div>
        )}
      </div>

      {selected && !showForm && (
        <PartDetail part={selected} onClose={() => setSelected(null)}
          onEdit={() => { setEditPart(selected); setShowForm(true); }}
          onDelete={() => handleDelete(selected.id)} />
      )}
      {showForm && (
        <PartForm part={editPart} parts={parts} onClose={() => { setShowForm(false); setEditPart(null); }}
          onSave={() => { setShowForm(false); setEditPart(null); setSelected(null); load(); }} />
      )}
    </div>
  );
}
