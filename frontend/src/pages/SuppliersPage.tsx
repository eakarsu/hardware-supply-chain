import { useEffect, useState } from 'react';
import { api } from '../api';
import { Supplier } from '../types';
import { Plus, Search, Truck, Star, X, Edit2, Trash2, Globe } from 'lucide-react';

const flagMap: Record<string, string> = {
  'USA': '🇺🇸', 'China': '🇨🇳', 'Germany': '🇩🇪', 'Japan': '🇯🇵', 'South Korea': '🇰🇷'
};

function SupplierForm({ supplier, onSave, onClose }: { supplier?: Supplier | null; onSave: () => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: supplier?.name || '', country: supplier?.country || '',
    city: supplier?.city || '', contact_email: supplier?.contact_email || '',
    contact_phone: supplier?.contact_phone || '', lead_time_days: supplier?.lead_time_days || '',
    reliability_score: supplier?.reliability_score || '', min_order_qty: supplier?.min_order_qty || '',
    payment_terms: supplier?.payment_terms || '', certifications: supplier?.certifications || '',
    active: supplier?.active !== false, joined_date: supplier?.joined_date?.split('T')[0] || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (supplier) await api.updateSupplier(supplier.id, form);
      else await api.createSupplier(form);
      onSave();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-white font-semibold">{supplier ? 'Edit Supplier' : 'New Supplier'}</h2>
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
              <label className="block text-xs text-gray-400 mb-1">City</label>
              <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Contact Email</label>
              <input type="email" value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Phone</label>
              <input value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Lead Time (days)</label>
              <input type="number" value={form.lead_time_days} onChange={e => setForm({ ...form, lead_time_days: parseInt(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Reliability Score (0-10)</label>
              <input type="number" step="0.1" min="0" max="10" value={form.reliability_score} onChange={e => setForm({ ...form, reliability_score: parseFloat(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Min Order Qty</label>
              <input type="number" value={form.min_order_qty} onChange={e => setForm({ ...form, min_order_qty: parseInt(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Payment Terms</label>
              <input value={form.payment_terms} onChange={e => setForm({ ...form, payment_terms: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Certifications</label>
              <input value={form.certifications} onChange={e => setForm({ ...form, certifications: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Joined Date</label>
              <input type="date" value={form.joined_date} onChange={e => setForm({ ...form, joined_date: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input type="checkbox" id="active" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })}
                className="rounded bg-gray-800 border-gray-700" />
              <label htmlFor="active" className="text-sm text-gray-300">Active Supplier</label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg text-sm font-medium">Save Supplier</button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SupplierDetail({ supplier, onEdit, onDelete, onClose }: { supplier: Supplier; onEdit: () => void; onDelete: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-y-0 right-0 w-1/2 bg-gray-900 border-l border-gray-800 z-40 overflow-y-auto">
      <div className="p-6 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-lg">{supplier.name}</h2>
          <p className="text-gray-400 text-sm">{flagMap[supplier.country] || <Globe className="w-4 h-4 inline" />} {supplier.city}, {supplier.country}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onEdit} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"><Edit2 className="w-4 h-4" /></button>
          <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg"><Trash2 className="w-4 h-4" /></button>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
      </div>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${supplier.active ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
            {supplier.active ? 'Active' : 'Inactive'}
          </span>
          <div className="flex items-center gap-1 text-yellow-400">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">{supplier.reliability_score}/10</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Lead Time', `${supplier.lead_time_days} days`],
            ['Min Order', supplier.min_order_qty],
            ['Payment Terms', supplier.payment_terms],
            ['Joined', supplier.joined_date?.split('T')[0]],
          ].map(([label, value]) => (
            <div key={String(label)} className="bg-gray-800 rounded-lg p-3">
              <p className="text-gray-500 text-xs">{label}</p>
              <p className="text-white font-medium mt-1 text-sm">{value}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="text-gray-500 text-xs mb-2">Contact</p>
          <p className="text-gray-300 text-sm">{supplier.contact_email}</p>
          <p className="text-gray-300 text-sm">{supplier.contact_phone}</p>
        </div>
        {supplier.certifications && (
          <div>
            <p className="text-gray-500 text-xs mb-2">Certifications</p>
            <div className="flex flex-wrap gap-2">
              {supplier.certifications.split(',').map((c, i) => (
                <span key={i} className="px-2 py-0.5 bg-gray-800 text-gray-300 text-xs rounded">{c.trim()}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);

  const load = async () => { setSuppliers(await api.getSuppliers()); };
  useEffect(() => { load(); }, []);

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.country?.toLowerCase().includes(search.toLowerCase()) ||
    s.city?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this supplier?')) return;
    await api.deleteSupplier(id);
    setSelected(null);
    load();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Suppliers</h1>
          <p className="text-gray-400 text-sm mt-1">{suppliers.filter(s => s.active).length} active suppliers</p>
        </div>
        <button onClick={() => { setEditSupplier(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" /> New Supplier
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search suppliers..."
          className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(s => (
          <div key={s.id} onClick={() => setSelected(s)}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-orange-600 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                  <Truck className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{s.name}</p>
                  <p className="text-gray-500 text-xs">{flagMap[s.country] || '🌐'} {s.city}, {s.country}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs ${s.active ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                {s.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-800 rounded-lg p-2">
                <p className="text-white font-bold text-sm">{s.reliability_score}</p>
                <p className="text-gray-500 text-xs">Score</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-2">
                <p className="text-white font-bold text-sm">{s.lead_time_days}d</p>
                <p className="text-gray-500 text-xs">Lead</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-2">
                <p className="text-white font-bold text-sm">{s.min_order_qty}</p>
                <p className="text-gray-500 text-xs">Min Qty</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && !showForm && (
        <SupplierDetail supplier={selected} onClose={() => setSelected(null)}
          onEdit={() => { setEditSupplier(selected); setShowForm(true); }}
          onDelete={() => handleDelete(selected.id)} />
      )}
      {showForm && (
        <SupplierForm supplier={editSupplier} onClose={() => { setShowForm(false); setEditSupplier(null); }}
          onSave={() => { setShowForm(false); setEditSupplier(null); setSelected(null); load(); }} />
      )}
    </div>
  );
}
