import { useEffect, useState } from 'react';
import { GitPullRequest, FileCheck, Send, Check, X, Play } from 'lucide-react';

interface ECN { id: number; ecn_number: string; bom_id: number; product_name?: string; revision?: string; change_type: string; description: string; reason: string; status: string; ppap_level: number; ppap_required_docs: string; initiated_by: string; approved_by?: string; approved_at?: string; target_effective_date?: string; created_at: string; }

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-gray-700 text-gray-300',
  in_review: 'bg-blue-900 text-blue-300',
  approved: 'bg-green-900 text-green-300',
  rejected: 'bg-red-900 text-red-300',
  implemented: 'bg-violet-900 text-violet-300',
};

const REASONS = ['COST', 'EOL', 'SHORTAGE', 'QUALITY', 'REGULATORY'];
const CHANGE_TYPES = ['MPN_SWAP', 'REV_BUMP', 'SOURCE_ADD', 'OBSOLETE_REPLACEMENT'];

async function jget(p: string) {
  const t = localStorage.getItem('token') || '';
  const r = await fetch(`/api${p}`, { headers: { Authorization: `Bearer ${t}` } });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.statusText);
  return r.json();
}
async function jpost(p: string, body: any) {
  const t = localStorage.getItem('token') || '';
  const r = await fetch(`/api${p}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.statusText);
  return r.json();
}

export default function EcnPage() {
  const [ecns, setEcns] = useState<ECN[]>([]);
  const [boms, setBoms] = useState<any[]>([]);
  const [matrix, setMatrix] = useState<any>({});
  const [selected, setSelected] = useState<ECN | null>(null);
  const [docStatus, setDocStatus] = useState<any>(null);
  const [err, setErr] = useState('');
  const [form, setForm] = useState<any>({ ecn_number: '', change_type: 'MPN_SWAP', description: '', reason: 'COST', ppap_level: 3, ppap_required_docs: '', initiated_by: '' });

  async function load() {
    setErr('');
    try {
      setEcns(await jget('/ecn'));
      setBoms(await jget('/bom'));
      setMatrix(await jget('/ecn/ppap-matrix'));
    } catch (e: any) { setErr(e.message); }
  }
  useEffect(() => { load(); }, []);

  async function pick(e: ECN) {
    setSelected(e);
    try { setDocStatus(await jget(`/ecn/${e.id}/ppap-doc-status`)); }
    catch (er: any) { setErr(er.message); }
  }

  async function transition(path: string) {
    if (!selected) return;
    try { await jpost(`/ecn/${selected.id}/${path}`, {}); load(); }
    catch (e: any) {
      // If implement requires PPAP completion, surface the missing list.
      setErr(e.message);
    }
  }
  async function forceImplement() {
    if (!selected) return;
    try { await jpost(`/ecn/${selected.id}/implement`, { force: true }); load(); }
    catch (e: any) { setErr(e.message); }
  }

  async function create() {
    setErr('');
    try { await jpost('/ecn', form); setForm({ ...form, ecn_number: '', description: '' }); load(); }
    catch (e: any) { setErr(e.message); }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><GitPullRequest className="w-6 h-6 text-orange-500" /> ECN + PPAP Workflow</h1>
        <p className="text-gray-400 text-sm mt-1">Engineering Change Notice lifecycle (draft → in_review → approved → implemented). PPAP Level 1-5 per AIAG.</p>
      </div>
      {err && <div className="mb-4 bg-red-950 border border-red-800 text-red-300 p-3 rounded-lg text-sm">{err}</div>}

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">ECN Log ({ecns.length})</div>
          <table className="w-full text-xs">
            <thead><tr className="text-gray-500">
              <th className="px-3 py-2 text-left">ECN#</th><th className="px-3 py-2 text-left">Product</th>
              <th className="px-3 py-2 text-left">Type</th><th className="px-3 py-2 text-left">Reason</th>
              <th className="px-3 py-2 text-left">PPAP L</th><th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Owner</th>
            </tr></thead>
            <tbody>
              {ecns.map(e => (
                <tr key={e.id} onClick={() => pick(e)}
                  className={`border-t border-gray-800 cursor-pointer hover:bg-gray-800/60 ${selected?.id === e.id ? 'bg-gray-800/80' : ''}`}>
                  <td className="px-3 py-2 font-mono text-orange-400">{e.ecn_number}</td>
                  <td className="px-3 py-2 text-white">{e.product_name} <span className="text-gray-500">{e.revision}</span></td>
                  <td className="px-3 py-2 text-gray-400">{e.change_type}</td>
                  <td className="px-3 py-2 text-gray-400">{e.reason}</td>
                  <td className="px-3 py-2 text-gray-300">L{e.ppap_level}</td>
                  <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLOR[e.status]}`}>{e.status}</span></td>
                  <td className="px-3 py-2 text-gray-400">{e.initiated_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="col-span-4 space-y-3">
          {selected && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="text-white font-mono font-bold">{selected.ecn_number}</div>
              <div className="text-gray-400 text-xs">{selected.product_name} {selected.revision}</div>
              <div className="text-gray-300 text-sm mt-2">{selected.description}</div>
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div><span className="text-gray-500">Type</span> <span className="text-gray-300">{selected.change_type}</span></div>
                <div><span className="text-gray-500">Reason</span> <span className="text-gray-300">{selected.reason}</span></div>
                <div><span className="text-gray-500">PPAP</span> <span className="text-gray-300">L{selected.ppap_level}</span></div>
                <div><span className="text-gray-500">Status</span> <span className={`px-1.5 py-0.5 rounded ${STATUS_COLOR[selected.status]}`}>{selected.status}</span></div>
                <div><span className="text-gray-500">Initiator</span> <span className="text-gray-300">{selected.initiated_by}</span></div>
                <div><span className="text-gray-500">Approver</span> <span className="text-gray-300">{selected.approved_by || '—'}</span></div>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {selected.status === 'draft' && <button onClick={() => transition('submit')} className="flex items-center gap-1 bg-blue-700 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"><Send className="w-3 h-3" />Submit</button>}
                {selected.status === 'in_review' && <button onClick={() => transition('approve')} className="flex items-center gap-1 bg-green-700 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"><Check className="w-3 h-3" />Approve</button>}
                {selected.status === 'in_review' && <button onClick={() => transition('reject')} className="flex items-center gap-1 bg-red-700 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"><X className="w-3 h-3" />Reject</button>}
                {selected.status === 'approved' && <button onClick={() => transition('implement')} className="flex items-center gap-1 bg-violet-700 hover:bg-violet-600 text-white px-2 py-1 rounded text-xs"><Play className="w-3 h-3" />Implement</button>}
                {selected.status === 'approved' && docStatus && !docStatus.is_complete && <button onClick={forceImplement} className="bg-yellow-700 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs">Force impl.</button>}
              </div>
            </div>
          )}

          {docStatus && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2"><FileCheck className="w-4 h-4 text-orange-400" /><div className="text-gray-400 text-xs uppercase tracking-wider">PPAP L{docStatus.ppap_level} doc status</div></div>
              <div className="text-xs">
                <div className="text-green-400 mb-1">Present ({docStatus.present.length}): {docStatus.present.join(', ') || '—'}</div>
                <div className="text-red-400">Missing ({docStatus.missing.length}): {docStatus.missing.join(', ') || 'None'}</div>
                {docStatus.is_complete ? <div className="mt-2 text-green-400 font-medium">All PPAP docs present.</div> : <div className="mt-2 text-yellow-400 font-medium">Incomplete — implement will require force=true.</div>}
              </div>
            </div>
          )}

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">New ECN</div>
            <div className="space-y-2 text-xs">
              <input value={form.ecn_number} onChange={e => setForm({ ...form, ecn_number: e.target.value })} placeholder="ECN-2026-007" className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white" />
              <select value={form.bom_id || ''} onChange={e => setForm({ ...form, bom_id: parseInt(e.target.value, 10) })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white">
                <option value="">Select BOM</option>
                {boms.map((b: any) => <option key={b.id} value={b.id}>{b.product_name} {b.revision}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <select value={form.change_type} onChange={e => setForm({ ...form, change_type: e.target.value })} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white">{CHANGE_TYPES.map(t => <option key={t}>{t}</option>)}</select>
                <select value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white">{REASONS.map(r => <option key={r}>{r}</option>)}</select>
              </div>
              <input type="number" min="1" max="5" value={form.ppap_level} onChange={e => setForm({ ...form, ppap_level: parseInt(e.target.value, 10) })} placeholder="PPAP level 1-5" className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white" />
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white" />
              <input value={form.ppap_required_docs} onChange={e => setForm({ ...form, ppap_required_docs: e.target.value })} placeholder="DFMEA,PFMEA,CONTROL_PLAN..." className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white" />
              <button onClick={create} className="w-full bg-orange-600 hover:bg-orange-700 text-white px-2 py-1.5 rounded">Create</button>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              <div className="text-gray-400 font-semibold mb-1">PPAP Required Docs Matrix</div>
              {Object.entries(matrix).map(([lvl, docs]: any) => (
                <div key={lvl}><span className="text-orange-400">L{lvl}</span>: {Array.isArray(docs) ? docs.join(', ') : ''}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
