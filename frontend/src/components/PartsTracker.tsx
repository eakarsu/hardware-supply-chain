import { useState } from 'react'

type Status = 'ordered' | 'in_production' | 'shipped' | 'received'

interface Part {
  id: number
  name: string
  description: string
  supplier: string
  leadTime: number
  status: Status
  createdDate: string
  partNumber: string
}

const initialParts: Part[] = [
  { id: 1, name: 'Custom PCBA v2.3', description: '6-layer PCB with STM32H7 controller', supplier: 'PCBWay', leadTime: 12, status: 'in_production', createdDate: '2026-04-20', partNumber: 'PCB-023' },
  { id: 2, name: 'Aluminum Enclosure', description: 'CNC-machined 6061-T6 housing', supplier: 'Xometry', leadTime: 18, status: 'ordered', createdDate: '2026-04-25', partNumber: 'ENC-007' },
  { id: 3, name: 'BLDC Motor 42mm', description: '48V 500W brushless DC motor', supplier: 'Shenzhen Kinco', leadTime: 7, status: 'shipped', createdDate: '2026-04-15', partNumber: 'MOT-042' },
  { id: 4, name: 'LiPo Battery Pack', description: '22.2V 10Ah custom cell arrangement', supplier: 'CATL OEM', leadTime: 21, status: 'ordered', createdDate: '2026-04-22', partNumber: 'BAT-022' },
  { id: 5, name: 'Gear Assembly Kit', description: 'Planetary gearbox 20:1 ratio', supplier: 'Designatronics', leadTime: 14, status: 'received', createdDate: '2026-04-08', partNumber: 'GEA-020' },
  { id: 6, name: 'Sensor Array Module', description: 'IMU + ToF + Barometer combo board', supplier: 'JLCPCB', leadTime: 8, status: 'in_production', createdDate: '2026-04-28', partNumber: 'SEN-012' },
  { id: 7, name: 'Power Management IC', description: 'Multi-rail PMIC with BMS integration', supplier: 'Arrow Electronics', leadTime: 5, status: 'received', createdDate: '2026-04-10', partNumber: 'PMIC-008' },
  { id: 8, name: 'Flex PCB Harness', description: 'Custom flex cable 32-pin JST', supplier: 'PCBWay', leadTime: 10, status: 'shipped', createdDate: '2026-04-18', partNumber: 'FLX-032' },
]

const statusConfig: Record<Status, { label: string; color: string; dot: string }> = {
  ordered: { label: 'Ordered', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  in_production: { label: 'In Production', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  received: { label: 'Received', color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
}

const allStatuses: (Status | 'all')[] = ['all', 'ordered', 'in_production', 'shipped', 'received']

export default function PartsTracker() {
  const [parts, setParts] = useState<Part[]>(initialParts)
  const [filter, setFilter] = useState<Status | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', supplier: '', leadTime: 10, partNumber: '' })

  const filtered = filter === 'all' ? parts : parts.filter(p => p.status === filter)

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const newPart: Part = {
      id: Date.now(),
      name: form.name,
      description: form.description,
      supplier: form.supplier,
      leadTime: form.leadTime,
      partNumber: form.partNumber,
      status: 'ordered',
      createdDate: new Date().toISOString().split('T')[0],
    }
    setParts(prev => [newPart, ...prev])
    setForm({ name: '', description: '', supplier: '', leadTime: 10, partNumber: '' })
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Parts Tracker</h2>
          <p className="text-gray-500 text-sm mt-0.5">{parts.length} parts in system</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Add Part
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {allStatuses.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              filter === s
                ? 'bg-blue-700 text-white border-blue-700'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {s === 'all' ? 'All' : s === 'in_production' ? 'In Production' : s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="ml-1.5 text-xs opacity-70">
              ({s === 'all' ? parts.length : parts.filter(p => p.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Add New Part</h3>
          <form onSubmit={handleAdd}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Part Name *</label>
                <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Custom PCBA v3" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Part Number</label>
                <input value={form.partNumber} onChange={e => setForm(p => ({ ...p, partNumber: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. PCB-024" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Supplier</label>
                <input value={form.supplier} onChange={e => setForm(p => ({ ...p, supplier: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. PCBWay" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Lead Time (days)</label>
                <input type="number" min={1} max={365} value={form.leadTime}
                  onChange={e => setForm(p => ({ ...p, leadTime: parseInt(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors">
                Add Part
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
              <th className="text-left px-4 py-3">Part</th>
              <th className="text-left px-4 py-3">Part #</th>
              <th className="text-left px-4 py-3">Supplier</th>
              <th className="text-center px-4 py-3">Lead Time</th>
              <th className="text-center px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((part, i) => (
              <tr key={part.id} className={i < filtered.length - 1 ? 'border-b border-gray-100' : ''}>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{part.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{part.description}</div>
                </td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{part.partNumber}</td>
                <td className="px-4 py-3 text-gray-600">{part.supplier}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-medium ${part.leadTime > 14 ? 'text-red-500' : part.leadTime > 7 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {part.leadTime}d
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${statusConfig[part.status].color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[part.status].dot}`} />
                    {statusConfig[part.status].label}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-400 text-xs">
                  {new Date(part.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
