import { useEffect, useState } from 'react';
import { api } from '../api';
import { Order, Part, Supplier } from '../types';
import { Plus, Search, ShoppingCart, X, Edit2, Trash2 } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-gray-700 text-gray-300',
  confirmed: 'bg-blue-900 text-blue-300',
  in_production: 'bg-yellow-900 text-yellow-300',
  shipped: 'bg-purple-900 text-purple-300',
  received: 'bg-green-900 text-green-300',
  cancelled: 'bg-red-900 text-red-300',
};

function OrderForm({ order, parts, suppliers, onSave, onClose }: { order?: Order | null; parts: Part[]; suppliers: Supplier[]; onSave: () => void; onClose: () => void }) {
  const [form, setForm] = useState({
    part_id: order?.part_id || '',
    supplier_id: order?.supplier_id || '',
    quantity: order?.quantity || '',
    unit_price: order?.unit_price || '',
    status: order?.status || 'pending',
    expected_by: order?.expected_by?.split('T')[0] || '',
    tracking_number: order?.tracking_number || '',
    notes: order?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, total_cost: Number(form.quantity) * Number(form.unit_price) };
    try {
      if (order) await api.updateOrder(order.id, data);
      else await api.createOrder(data);
      onSave();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-white font-semibold">{order ? 'Edit Order' : 'New Order'}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Part *</label>
              <select required value={form.part_id} onChange={e => setForm({ ...form, part_id: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500">
                <option value="">Select part...</option>
                {parts.map(p => <option key={p.id} value={p.id}>{p.name} ({p.part_number})</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Supplier *</label>
              <select required value={form.supplier_id} onChange={e => setForm({ ...form, supplier_id: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500">
                <option value="">Select supplier...</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.country})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Quantity *</label>
              <input required type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Unit Price ($) *</label>
              <input required type="number" step="0.01" value={form.unit_price} onChange={e => setForm({ ...form, unit_price: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500">
                {['pending','confirmed','in_production','shipped','received','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Expected By</label>
              <input type="date" value={form.expected_by} onChange={e => setForm({ ...form, expected_by: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Tracking Number</label>
              <input value={form.tracking_number} onChange={e => setForm({ ...form, tracking_number: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Notes</label>
              <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            </div>
            {form.quantity && form.unit_price && (
              <div className="col-span-2 bg-orange-900/30 border border-orange-800 rounded-lg p-3">
                <p className="text-orange-300 text-sm">Total Cost: <strong>${(Number(form.quantity) * Number(form.unit_price)).toFixed(2)}</strong></p>
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg text-sm font-medium">Save Order</button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OrderDetail({ order, onEdit, onDelete, onClose }: { order: Order; onEdit: () => void; onDelete: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-y-0 right-0 w-1/2 bg-gray-900 border-l border-gray-800 z-40 overflow-y-auto">
      <div className="p-6 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-lg">Order #{order.id}</h2>
          <p className="text-gray-400 text-sm">{order.part_name} — {order.supplier_name}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onEdit} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"><Edit2 className="w-4 h-4" /></button>
          <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg"><Trash2 className="w-4 h-4" /></button>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[order.status] || 'bg-gray-700 text-gray-300'}`}>{order.status}</span>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Part', order.part_name],
            ['Part #', order.part_number],
            ['Supplier', order.supplier_name],
            ['Quantity', order.quantity],
            ['Unit Price', `$${Number(order.unit_price).toFixed(2)}`],
            ['Total Cost', `$${Number(order.total_cost).toFixed(2)}`],
            ['Ordered', order.ordered_at?.split('T')[0]],
            ['Expected', order.expected_by?.split('T')[0]],
          ].map(([label, value]) => (
            <div key={String(label)} className="bg-gray-800 rounded-lg p-3">
              <p className="text-gray-500 text-xs">{label}</p>
              <p className="text-white font-medium mt-1 text-sm">{value || '—'}</p>
            </div>
          ))}
        </div>
        {order.tracking_number && (
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-gray-500 text-xs">Tracking</p>
            <p className="text-white font-mono text-sm mt-1">{order.tracking_number}</p>
          </div>
        )}
        {order.notes && (
          <div>
            <p className="text-gray-500 text-xs mb-1">Notes</p>
            <p className="text-gray-300 text-sm">{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);

  const load = async () => {
    const [o, p, s] = await Promise.all([api.getOrders(), api.getParts(), api.getSuppliers()]);
    setOrders(o); setParts(p); setSuppliers(s);
  };
  useEffect(() => { load(); }, []);

  const filtered = orders.filter(o =>
    o.part_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.supplier_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.tracking_number?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this order?')) return;
    await api.deleteOrder(id);
    setSelected(null);
    load();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Purchase Orders</h1>
          <p className="text-gray-400 text-sm mt-1">{orders.length} orders | ${orders.reduce((a, o) => a + Number(o.total_cost), 0).toLocaleString()} total value</p>
        </div>
        <button onClick={() => { setEditOrder(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" /> New Order
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..."
          className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500" />
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              {['Order', 'Part', 'Supplier', 'Qty', 'Total', 'Expected', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} onClick={() => setSelected(o)}
                className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-orange-500" />
                    <span className="text-white text-sm font-medium">#{o.id}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-white text-sm">{o.part_name}</p>
                  <p className="text-gray-500 text-xs">{o.part_number}</p>
                </td>
                <td className="px-4 py-3 text-gray-300 text-sm">{o.supplier_name}</td>
                <td className="px-4 py-3 text-gray-300 text-sm">{o.quantity}</td>
                <td className="px-4 py-3 text-gray-300 text-sm">${Number(o.total_cost).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-300 text-sm">{o.expected_by?.split('T')[0]}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[o.status] || 'bg-gray-700 text-gray-300'}`}>{o.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-gray-600">No orders found</div>}
      </div>

      {selected && !showForm && (
        <OrderDetail order={selected} onClose={() => setSelected(null)}
          onEdit={() => { setEditOrder(selected); setShowForm(true); }}
          onDelete={() => handleDelete(selected.id)} />
      )}
      {showForm && (
        <OrderForm order={editOrder} parts={parts} suppliers={suppliers}
          onClose={() => { setShowForm(false); setEditOrder(null); }}
          onSave={() => { setShowForm(false); setEditOrder(null); setSelected(null); load(); }} />
      )}
    </div>
  );
}
