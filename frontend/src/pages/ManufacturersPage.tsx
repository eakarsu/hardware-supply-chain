import { useEffect, useState } from 'react';
import { api } from '../api';
import { Manufacturer } from '../types';
import { Plus, Search, Factory, Star, X, Edit2, Trash2 } from 'lucide-react';

function ManufacturerForm({ mfr, onSave, onClose }: { mfr?: Manufacturer | null; onSave: () => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: mfr?.name || '', location: mfr?.location || '',
    country: mfr?.country || '', capacity_per_day: mfr?.capacity_per_day || '',
    specialization: mfr?.specialization || '', rating: mfr?.rating || '',
    certifications: mfr?.certifications || '', min_run: mfr?.min_run || '',
    turnaround_days: mfr?.turnaround_days || '', contact: mfr?.contact || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mfr) await api.updateManufacturer(mfr.id, form);
      else await api.createManufacturer(form);
      onSave();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-white font-semibold">{mfr ? 'Edit Manufacturer' : 'New Manufacturer'}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Company Name *</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Country</label>
              <input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Location</label>
              <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Capacity/Day</label>
              <input type="number" value={form.capacity_per_day} onChange={e => setForm({ ...form, capacity_per_day: parseInt(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Rating (0-5)</label>
              <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => setForm({ ...form, rating: parseFloat(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Min Run</label>
              <input type="number" value={form.min_run} onChange={e => setForm({ ...form, min_run: parseInt(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Turnaround (days)</label>
              <input type="number" value={form.turnaround_days} onChange={e => setForm({ ...form, turnaround_days: parseInt(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Specialization</label>
              <textarea rows={2} value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Certifications</label>
              <input value={form.certifications} onChange={e => setForm({ ...form, certifications: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Contact</label>
              <input value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })}
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

export default function ManufacturersPage() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Manufacturer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editMfr, setEditMfr] = useState<Manufacturer | null>(null);

  const load = async () => { setManufacturers(await api.getManufacturers()); };
  useEffect(() => { load(); }, []);

  const filtered = manufacturers.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.country?.toLowerCase().includes(search.toLowerCase()) ||
    m.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Manufacturers</h1>
          <p className="text-gray-400 text-sm mt-1">{manufacturers.length} manufacturers</p>
        </div>
        <button onClick={() => { setEditMfr(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" /> New Manufacturer
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search manufacturers..."
          className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(m => (
          <div key={m.id} onClick={() => setSelected(m)}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-orange-600 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Factory className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-white font-medium text-sm">{m.name}</p>
                  <p className="text-gray-500 text-xs">{m.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-sm">{m.rating}</span>
              </div>
            </div>
            <p className="text-gray-400 text-xs mb-3 line-clamp-2">{m.specialization}</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-800 rounded-lg p-2">
                <p className="text-white font-bold text-xs">{m.capacity_per_day?.toLocaleString()}</p>
                <p className="text-gray-500 text-xs">Cap/Day</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-2">
                <p className="text-white font-bold text-xs">{m.turnaround_days}d</p>
                <p className="text-gray-500 text-xs">Turn</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-2">
                <p className="text-white font-bold text-xs">{m.min_run}</p>
                <p className="text-gray-500 text-xs">Min</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && !showForm && (
        <div className="fixed inset-y-0 right-0 w-1/2 bg-gray-900 border-l border-gray-800 z-40 overflow-y-auto">
          <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-white font-semibold text-lg">{selected.name}</h2>
              <p className="text-gray-400 text-sm">{selected.location}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setEditMfr(selected); setShowForm(true); }} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"><Edit2 className="w-4 h-4" /></button>
              <button onClick={async () => { if (!confirm('Delete?')) return; await api.deleteManufacturer(selected.id); setSelected(null); load(); }} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              <button onClick={() => setSelected(null)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-yellow-400">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-medium">{selected.rating}/5</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Country', selected.country],
                ['Capacity/Day', selected.capacity_per_day?.toLocaleString()],
                ['Min Run', selected.min_run],
                ['Turnaround', `${selected.turnaround_days} days`],
              ].map(([label, value]) => (
                <div key={String(label)} className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-500 text-xs">{label}</p>
                  <p className="text-white font-medium mt-1 text-sm">{value || '—'}</p>
                </div>
              ))}
            </div>
            <div><p className="text-gray-500 text-xs mb-1">Specialization</p><p className="text-gray-300 text-sm">{selected.specialization}</p></div>
            {selected.certifications && (
              <div>
                <p className="text-gray-500 text-xs mb-2">Certifications</p>
                <div className="flex flex-wrap gap-2">
                  {selected.certifications.split(',').map((c, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-800 text-gray-300 text-xs rounded">{c.trim()}</span>
                  ))}
                </div>
              </div>
            )}
            <div><p className="text-gray-500 text-xs mb-1">Contact</p><p className="text-gray-300 text-sm">{selected.contact}</p></div>
          </div>
        </div>
      )}

      {showForm && (
        <ManufacturerForm mfr={editMfr}
          onClose={() => { setShowForm(false); setEditMfr(null); }}
          onSave={() => { setShowForm(false); setEditMfr(null); setSelected(null); load(); }} />
      )}
    </div>
  );
}
