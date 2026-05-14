import { useEffect, useState } from 'react';
import { api } from '../api';
import { QualityCheck, Part, Order } from '../types';
import { Plus, Search, CheckSquare, CheckCircle, XCircle, X, Edit2, Trash2 } from 'lucide-react';

function QualityForm({ qc, parts, orders, onSave, onClose }: { qc?: QualityCheck | null; parts: Part[]; orders: Order[]; onSave: () => void; onClose: () => void }) {
  const [form, setForm] = useState({
    part_id: qc?.part_id || '',
    order_id: qc?.order_id || '',
    inspector: qc?.inspector || '',
    pass: qc?.pass !== false,
    defect_rate: qc?.defect_rate || '',
    sample_size: qc?.sample_size || '',
    notes: qc?.notes || '',
    check_date: qc?.check_date?.split('T')[0] || '',
    failure_modes: qc?.failure_modes || '',
    corrective_action: qc?.corrective_action || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, order_id: form.order_id || null };
    try {
      if (qc) await api.updateQualityCheck(qc.id, data);
      else await api.createQualityCheck(data);
      onSave();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-white font-semibold">{qc ? 'Edit Quality Check' : 'New Quality Check'}</h2>
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
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Order (optional)</label>
              <select value={form.order_id} onChange={e => setForm({ ...form, order_id: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500">
                <option value="">No specific order</option>
                {orders.map(o => <option key={o.id} value={o.id}>Order #{o.id} — {o.part_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Inspector</label>
              <input value={form.inspector} onChange={e => setForm({ ...form, inspector: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Check Date</label>
              <input type="date" value={form.check_date} onChange={e => setForm({ ...form, check_date: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Sample Size</label>
              <input type="number" value={form.sample_size} onChange={e => setForm({ ...form, sample_size: parseInt(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Defect Rate (%)</label>
              <input type="number" step="0.1" value={form.defect_rate} onChange={e => setForm({ ...form, defect_rate: parseFloat(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id="pass" checked={form.pass} onChange={e => setForm({ ...form, pass: e.target.checked })}
                className="rounded bg-gray-800 border-gray-700" />
              <label htmlFor="pass" className="text-sm text-gray-300">Check Passed</label>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Notes</label>
              <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Failure Modes</label>
              <input value={form.failure_modes} onChange={e => setForm({ ...form, failure_modes: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Corrective Action</label>
              <textarea rows={2} value={form.corrective_action} onChange={e => setForm({ ...form, corrective_action: e.target.value })}
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

export default function QualityPage() {
  const [checks, setChecks] = useState<QualityCheck[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<QualityCheck | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editQC, setEditQC] = useState<QualityCheck | null>(null);

  const load = async () => {
    const [qc, p, o] = await Promise.all([api.getQuality(), api.getParts(), api.getOrders()]);
    setChecks(qc); setParts(p); setOrders(o);
  };
  useEffect(() => { load(); }, []);

  const filtered = checks.filter(c =>
    c.part_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.inspector?.toLowerCase().includes(search.toLowerCase())
  );

  const passRate = checks.length ? Math.round(checks.filter(c => c.pass).length / checks.length * 100) : 0;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Quality Checks</h1>
          <p className="text-gray-400 text-sm mt-1">{checks.length} checks | {passRate}% pass rate</p>
        </div>
        <button onClick={() => { setEditQC(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" /> New Check
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search quality checks..."
          className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500" />
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              {['Part', 'Inspector', 'Date', 'Sample', 'Defect Rate', 'Result'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} onClick={() => setSelected(c)}
                className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-white text-sm font-medium">{c.part_name}</p>
                      <p className="text-gray-500 text-xs">{c.part_number}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-300 text-sm">{c.inspector}</td>
                <td className="px-4 py-3 text-gray-300 text-sm">{c.check_date?.split('T')[0]}</td>
                <td className="px-4 py-3 text-gray-300 text-sm">{c.sample_size}</td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-medium ${Number(c.defect_rate) > 2 ? 'text-red-400' : Number(c.defect_rate) > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {c.defect_rate}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  {c.pass ? (
                    <span className="flex items-center gap-1 text-green-400 text-sm"><CheckCircle className="w-4 h-4" />Pass</span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-400 text-sm"><XCircle className="w-4 h-4" />Fail</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-gray-600">No quality checks found</div>}
      </div>

      {selected && !showForm && (
        <div className="fixed inset-y-0 right-0 w-1/2 bg-gray-900 border-l border-gray-800 z-40 overflow-y-auto">
          <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-white font-semibold text-lg">{selected.part_name}</h2>
              <p className="text-gray-400 text-sm">{selected.check_date?.split('T')[0]}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setEditQC(selected); setShowForm(true); }} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"><Edit2 className="w-4 h-4" /></button>
              <button onClick={async () => { if (!confirm('Delete?')) return; await api.deleteQualityCheck(selected.id); setSelected(null); load(); }} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              <button onClick={() => setSelected(null)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {selected.pass ? (
              <span className="flex items-center gap-2 text-green-400"><CheckCircle className="w-5 h-5" /> Passed</span>
            ) : (
              <span className="flex items-center gap-2 text-red-400"><XCircle className="w-5 h-5" /> Failed</span>
            )}
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Inspector', selected.inspector],
                ['Sample Size', selected.sample_size],
                ['Defect Rate', `${selected.defect_rate}%`],
                ['Part', selected.part_name],
              ].map(([label, value]) => (
                <div key={String(label)} className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-500 text-xs">{label}</p>
                  <p className="text-white font-medium mt-1 text-sm">{value || '—'}</p>
                </div>
              ))}
            </div>
            {selected.notes && <div><p className="text-gray-500 text-xs mb-1">Notes</p><p className="text-gray-300 text-sm">{selected.notes}</p></div>}
            {selected.failure_modes && <div><p className="text-gray-500 text-xs mb-1">Failure Modes</p><p className="text-gray-300 text-sm">{selected.failure_modes}</p></div>}
            {selected.corrective_action && <div><p className="text-gray-500 text-xs mb-1">Corrective Action</p><p className="text-gray-300 text-sm">{selected.corrective_action}</p></div>}
          </div>
        </div>
      )}

      {showForm && (
        <QualityForm qc={editQC} parts={parts} orders={orders}
          onClose={() => { setShowForm(false); setEditQC(null); }}
          onSave={() => { setShowForm(false); setEditQC(null); setSelected(null); load(); }} />
      )}
    </div>
  );
}
