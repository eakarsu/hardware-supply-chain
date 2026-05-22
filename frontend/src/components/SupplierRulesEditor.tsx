import { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { Settings2, Plus, Trash2 } from 'lucide-react';

interface Rule {
  id: number;
  name: string;
  country: string;
  max_lead_days: number;
  min_reliability: number;
  action: string;
  active: boolean;
}

const ACTIONS = ['flag', 'prefer', 'block', 'require_cert'];

export default function SupplierRulesEditor() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [err, setErr] = useState('');
  const [draft, setDraft] = useState({
    name: '',
    country: 'ANY',
    max_lead_days: 30,
    min_reliability: 8.5,
    action: 'flag',
    active: true,
  });

  const load = async () => {
    try {
      const r = await apiFetch('/custom-views/supplier-rules');
      setRules((r as { rules: Rule[] }).rules);
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!draft.name.trim()) return;
    try {
      await apiFetch('/custom-views/supplier-rules', {
        method: 'POST',
        body: JSON.stringify(draft),
      });
      setDraft({ ...draft, name: '' });
      load();
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  const update = async (id: number, patch: Partial<Rule>) => {
    try {
      await apiFetch(`/custom-views/supplier-rules/${id}`, {
        method: 'PUT',
        body: JSON.stringify(patch),
      });
      load();
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  const remove = async (id: number) => {
    try {
      await apiFetch(`/custom-views/supplier-rules/${id}`, { method: 'DELETE' });
      load();
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5" data-testid="supplier-rules-editor">
      <div className="flex items-center gap-2 mb-4">
        <Settings2 className="w-4 h-4 text-emerald-400" />
        <h3 className="text-white font-semibold text-sm">Supplier Rules Editor</h3>
        <span className="ml-auto text-xs text-gray-500">{rules.length} rules</span>
      </div>

      {err && <div className="bg-red-900/30 border border-red-800 text-red-300 text-xs rounded p-2 mb-3">{err}</div>}

      <div className="space-y-2 mb-4">
        {rules.map(r => (
          <div key={r.id} className="grid grid-cols-12 gap-2 items-center bg-gray-800/60 rounded-lg p-2 text-xs">
            <input
              className="col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
              value={r.name}
              onChange={e => setRules(rs => rs.map(x => x.id === r.id ? { ...x, name: e.target.value } : x))}
              onBlur={e => update(r.id, { name: e.target.value })}
            />
            <input
              className="col-span-2 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
              value={r.country}
              onChange={e => setRules(rs => rs.map(x => x.id === r.id ? { ...x, country: e.target.value } : x))}
              onBlur={e => update(r.id, { country: e.target.value })}
            />
            <input
              type="number"
              className="col-span-2 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
              value={r.max_lead_days}
              onChange={e => setRules(rs => rs.map(x => x.id === r.id ? { ...x, max_lead_days: Number(e.target.value) } : x))}
              onBlur={e => update(r.id, { max_lead_days: Number(e.target.value) })}
            />
            <input
              type="number"
              step="0.1"
              className="col-span-2 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
              value={r.min_reliability}
              onChange={e => setRules(rs => rs.map(x => x.id === r.id ? { ...x, min_reliability: Number(e.target.value) } : x))}
              onBlur={e => update(r.id, { min_reliability: Number(e.target.value) })}
            />
            <select
              className="col-span-2 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
              value={r.action}
              onChange={e => update(r.id, { action: e.target.value })}
            >
              {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <button
              onClick={() => remove(r.id)}
              className="col-span-1 text-red-400 hover:text-red-300 flex justify-center"
              title="Delete rule"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-800 pt-3">
        <div className="text-xs text-gray-500 mb-2">Add new rule</div>
        <div className="grid grid-cols-12 gap-2">
          <input
            placeholder="rule name"
            className="col-span-3 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white placeholder-gray-500"
            value={draft.name}
            onChange={e => setDraft({ ...draft, name: e.target.value })}
          />
          <input
            placeholder="country"
            className="col-span-2 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white placeholder-gray-500"
            value={draft.country}
            onChange={e => setDraft({ ...draft, country: e.target.value })}
          />
          <input
            type="number"
            placeholder="max lead"
            className="col-span-2 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white placeholder-gray-500"
            value={draft.max_lead_days}
            onChange={e => setDraft({ ...draft, max_lead_days: Number(e.target.value) })}
          />
          <input
            type="number"
            step="0.1"
            placeholder="min rel"
            className="col-span-2 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white placeholder-gray-500"
            value={draft.min_reliability}
            onChange={e => setDraft({ ...draft, min_reliability: Number(e.target.value) })}
          />
          <select
            className="col-span-2 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white"
            value={draft.action}
            onChange={e => setDraft({ ...draft, action: e.target.value })}
          >
            {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <button
            onClick={create}
            className="col-span-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded px-2 flex items-center justify-center"
            title="Add"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
