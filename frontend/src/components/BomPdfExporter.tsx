import { useState } from 'react';
import { FileDown } from 'lucide-react';

export default function BomPdfExporter() {
  const [bomId, setBomId] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  const download = async () => {
    setBusy(true);
    setStatus('');
    try {
      const token = localStorage.getItem('token') || '';
      const url = `/api/custom-views/bom-pdf${bomId ? `?bomId=${encodeURIComponent(bomId)}` : ''}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const lines = res.headers.get('X-BOM-Lines') || '?';
      const src = res.headers.get('X-BOM-Source') || '?';
      const blob = await res.blob();
      const dl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = dl;
      a.download = `bom-${bomId || 'demo'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(dl);
      setStatus(`Downloaded — ${lines} lines, source: ${src}`);
    } catch (e) {
      setStatus(`Failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5" data-testid="bom-pdf-exporter">
      <div className="flex items-center gap-2 mb-4">
        <FileDown className="w-4 h-4 text-blue-400" />
        <h3 className="text-white font-semibold text-sm">BOM PDF Export</h3>
      </div>
      <p className="text-xs text-gray-400 mb-3">
        Generates a PDF bill of materials. Leave the BOM id blank to synthesize a demo BOM from parts.
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="BOM id (optional)"
          value={bomId}
          onChange={e => setBomId(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={download}
          disabled={busy}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          {busy ? 'Building…' : 'Download PDF'}
        </button>
      </div>
      {status && <div className="text-xs text-gray-400 mt-3">{status}</div>}
    </div>
  );
}
