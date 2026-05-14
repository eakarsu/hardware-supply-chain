import { useEffect, useState } from 'react';
import { api } from '../api';
import { ScrollText, RefreshCw } from 'lucide-react';

interface AuditEntry {
  id: number;
  user_id: number | null;
  user_email: string | null;
  action: string;
  entity_type: string | null;
  entity_id: number | null;
  details: string | null;
  created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  ai_invocation: 'bg-violet-900 text-violet-300',
  csv_export: 'bg-emerald-900 text-emerald-300',
  login: 'bg-blue-900 text-blue-300',
};

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true); setErr('');
    try {
      const params: Record<string, string> = {};
      if (actionFilter) params.action = actionFilter;
      if (entityFilter) params.entity_type = entityFilter;
      const r = await api.getAuditLog(params);
      setEntries(r);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ScrollText className="w-6 h-6 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-white">Audit Log</h1>
            <p className="text-gray-400 text-sm">{entries.length} entries</p>
          </div>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Action</label>
          <input value={actionFilter} onChange={e => setActionFilter(e.target.value)} placeholder="e.g. ai_invocation, csv_export"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Entity Type</label>
          <input value={entityFilter} onChange={e => setEntityFilter(e.target.value)} placeholder="e.g. parts, ai_feature"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
        </div>
        <div className="flex items-end">
          <button onClick={load} className="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm">
            Apply filters
          </button>
        </div>
      </div>

      {err && <div className="text-red-400 text-sm mb-4">{err}</div>}

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              {['When', 'User', 'Action', 'Entity', 'Details'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.id} className="border-b border-gray-800/50">
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(e.created_at).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-300 text-sm">{e.user_email || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${ACTION_COLORS[e.action] || 'bg-gray-700 text-gray-300'}`}>{e.action}</span>
                </td>
                <td className="px-4 py-3 text-gray-300 text-sm">
                  {e.entity_type || '-'}{e.entity_id ? ` #${e.entity_id}` : ''}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs font-mono">{e.details || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && entries.length === 0 && (
          <div className="text-center py-12 text-gray-600">No audit entries yet</div>
        )}
      </div>
    </div>
  );
}
