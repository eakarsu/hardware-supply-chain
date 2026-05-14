import { useState, useEffect } from 'react';
import { api } from '../api';
import AIResponse from '../components/AIResponse';
import { Sparkles, TrendingUp, Users, AlertCircle, DollarSign, Shield, Layers, ShieldAlert, BarChart3, Globe } from 'lucide-react';

type TabId = 'lead-time' | 'supplier' | 'bottleneck' | 'cost' | 'supplier-risk' | 'bom-optimizer' | 'defect-predictor' | 'demand-forecast' | 'geopolitical';

interface QualityCheckLite { id: number; part_id: number; defect_rate: number; pass: boolean; sample_size: number; failure_modes: string }

export default function AICenterPage() {
  const [parts, setParts] = useState<{id: number; name: string; part_number: string; unit_cost: number; in_stock: number}[]>([]);
  const [suppliers, setSuppliers] = useState<{id: number; name: string; country: string}[]>([]);
  const [orders, setOrders] = useState<{id: number; part_id: number; supplier_id: number; part_name: string; quantity: number; ordered_at: string; status: string}[]>([]);
  const [iterations, setIterations] = useState<{id: number; part_name: string; version: string; iteration_hours: number}[]>([]);
  const [quality, setQuality] = useState<QualityCheckLite[]>([]);

  const [activeTab, setActiveTab] = useState<TabId>('lead-time');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [timestamp, setTimestamp] = useState('');

  const [ltPartId, setLtPartId] = useState('');
  const [ltSupplierId, setLtSupplierId] = useState('');

  const [srPartId, setSrPartId] = useState('');
  const [srReqs, setSrReqs] = useState('Fast delivery, ISO certified, good reliability');

  const [costPartId, setCostPartId] = useState('');

  // New feature state
  const [riskSupplierId, setRiskSupplierId] = useState('');
  const [bomLines, setBomLines] = useState('');
  const [defectPartId, setDefectPartId] = useState('');
  const [defectSupplierId, setDefectSupplierId] = useState('');
  const [demandPartId, setDemandPartId] = useState('');
  const [demandHorizon, setDemandHorizon] = useState('90');
  const [geoFocus, setGeoFocus] = useState('');

  useEffect(() => {
    Promise.all([api.getParts(), api.getSuppliers(), api.getOrders(), api.getIterations(), api.getQuality()])
      .then(([p, s, o, i, q]) => {
        setParts(p); setSuppliers(s); setOrders(o); setIterations(i); setQuality(q);
      })
      .catch(() => {});
  }, []);

  const run = async (fn: () => Promise<{result: string}>) => {
    setLoading(true);
    setResult('');
    try {
      const r = await fn();
      setResult(r.result);
      setTimestamp(new Date().toLocaleTimeString());
    } catch (e) {
      setResult('Error: ' + (e instanceof Error ? e.message : 'unknown'));
    } finally {
      setLoading(false);
    }
  };

  const tools: { id: TabId; label: string; icon: typeof TrendingUp; color: string }[] = [
    { id: 'lead-time', label: 'Lead Time Prediction', icon: TrendingUp, color: 'text-blue-400' },
    { id: 'supplier', label: 'Supplier Recommendation', icon: Users, color: 'text-green-400' },
    { id: 'bottleneck', label: 'Bottleneck Analysis', icon: AlertCircle, color: 'text-yellow-400' },
    { id: 'cost', label: 'Cost Optimization', icon: DollarSign, color: 'text-emerald-400' },
    { id: 'supplier-risk', label: 'Supplier Risk Score', icon: Shield, color: 'text-rose-400' },
    { id: 'bom-optimizer', label: 'BOM Cost Optimizer', icon: Layers, color: 'text-cyan-400' },
    { id: 'defect-predictor', label: 'Defect Predictor', icon: ShieldAlert, color: 'text-pink-400' },
    { id: 'demand-forecast', label: 'Demand Forecast', icon: BarChart3, color: 'text-indigo-400' },
    { id: 'geopolitical', label: 'Geopolitical Risk', icon: Globe, color: 'text-orange-400' },
  ];

  const parseBom = () => {
    return bomLines.split('\n').map(line => {
      const [partId, qty] = line.split(',').map(s => s.trim());
      const part = parts.find(p => String(p.id) === partId);
      return part ? { part, quantity: parseInt(qty) || 1 } : null;
    }).filter(Boolean);
  };

  // Sample-prefill helpers: find by name keyword, fall back to first item
  const findPartId = (kw: string) => {
    const m = parts.find(p => p.name.toLowerCase().includes(kw.toLowerCase()));
    return m ? String(m.id) : (parts[0] ? String(parts[0].id) : '');
  };
  const findSupplierId = (kw: string) => {
    const m = suppliers.find(s => s.name.toLowerCase().includes(kw.toLowerCase()));
    return m ? String(m.id) : (suppliers[0] ? String(suppliers[0].id) : '');
  };
  const bomLineFor = (kw: string, qty: number) => {
    const m = parts.find(p => p.name.toLowerCase().includes(kw.toLowerCase()));
    return m ? `${m.id},${qty}` : '';
  };
  const sampleBtnCls = "px-2 py-1 text-xs rounded-md bg-gray-800 hover:bg-violet-700 border border-gray-700 hover:border-violet-500 text-gray-300 hover:text-white transition-colors";

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-violet-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">AI Intelligence Center</h1>
          <p className="text-gray-400 text-sm">Supply chain intelligence powered by AI</p>
        </div>
      </div>

      <div className="grid grid-cols-3 lg:grid-cols-5 gap-2 mb-6">
        {tools.map(t => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); setResult(''); }}
            className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-colors ${activeTab === t.id ? 'bg-violet-900 border-violet-600 text-white' : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'}`}>
            <t.icon className={`w-4 h-4 ${t.color}`} />
            <span className="text-xs">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          {activeTab === 'lead-time' && (
            <div className="space-y-4">
              <h2 className="text-white font-semibold">Lead Time Prediction</h2>
              <p className="text-gray-400 text-sm">Predict actual delivery time vs quoted lead time based on historical data.</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 self-center mr-1">Samples:</span>
                <button type="button" className={sampleBtnCls}
                  onClick={() => { setLtPartId(findPartId('H100')); setLtSupplierId(findSupplierId('TSMC')); }}>
                  H100 / TSMC
                </button>
                <button type="button" className={sampleBtnCls}
                  onClick={() => { setLtPartId(findPartId('EPYC')); setLtSupplierId(findSupplierId('Foxconn')); }}>
                  EPYC 9654 / Foxconn
                </button>
                <button type="button" className={sampleBtnCls}
                  onClick={() => { setLtPartId(findPartId('DDR5')); setLtSupplierId(findSupplierId('Samsung')); }}>
                  DDR5 / Samsung
                </button>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Part</label>
                <select value={ltPartId} onChange={e => setLtPartId(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500">
                  <option value="">Select part...</option>
                  {parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Supplier</label>
                <select value={ltSupplierId} onChange={e => setLtSupplierId(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500">
                  <option value="">Select supplier...</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <button onClick={() => run(() => api.aiLeadTimePrediction({
                part: parts.find(p => String(p.id) === ltPartId),
                supplier: suppliers.find(s => String(s.id) === ltSupplierId),
                order_history: orders.slice(0, 5)
              }))} disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
                Predict Lead Time
              </button>
            </div>
          )}

          {activeTab === 'supplier' && (
            <div className="space-y-4">
              <h2 className="text-white font-semibold">Supplier Recommendation</h2>
              <p className="text-gray-400 text-sm">Get AI recommendation for the best supplier based on your requirements.</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 self-center mr-1">Samples:</span>
                <button type="button" className={sampleBtnCls}
                  onClick={() => { setSrPartId(findPartId('H100')); setSrReqs('AI/HPC GPU procurement: 90-day delivery, IATF 16949 + ISO 9001, allocation security amid US export controls to China, hedge against TSMC single-source risk.'); }}>
                  H100 GPU sourcing
                </button>
                <button type="button" className={sampleBtnCls}
                  onClick={() => { setSrPartId(findPartId('EPYC')); setSrReqs('Server CPU: Net 45 terms, MOQ 50 units, ISO 9001 certified, Taiwan or Japan preferred to diversify from Shenzhen, lead time under 35 days.'); }}>
                  EPYC server CPU
                </button>
                <button type="button" className={sampleBtnCls}
                  onClick={() => { setSrPartId(findPartId('DDR5')); setSrReqs('DDR5 RDIMM volume buy: 480+ units quarterly, ECC validation, RoHS, reliability score above 0.93, must support DDR5-4800 spec.'); }}>
                  DDR5 volume buy
                </button>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Part</label>
                <select value={srPartId} onChange={e => setSrPartId(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500">
                  <option value="">Select part...</option>
                  {parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Requirements</label>
                <textarea rows={3} value={srReqs} onChange={e => setSrReqs(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500" />
              </div>
              <button onClick={() => run(() => api.aiSupplierRecommendation({
                part: parts.find(p => String(p.id) === srPartId),
                requirements: srReqs,
                available_suppliers: suppliers
              }))} disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
                Get Recommendation
              </button>
            </div>
          )}

          {activeTab === 'bottleneck' && (
            <div className="space-y-4">
              <h2 className="text-white font-semibold">Bottleneck Analysis</h2>
              <p className="text-gray-400 text-sm">Identify supply chain bottlenecks by analyzing design iterations and order data. Highlights US vs Shenzhen manufacturing gaps.</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 self-center mr-1">Samples:</span>
                <button type="button" className={sampleBtnCls}
                  onClick={() => run(() => api.aiBottleneckAnalysis({
                    iterations: iterations.slice(0, 10),
                    orders: orders.slice(0, 10),
                    focus: 'TSMC wafer allocation and NVIDIA H100 lead-time gaps',
                  }))}>
                  TSMC / H100 focus
                </button>
                <button type="button" className={sampleBtnCls}
                  onClick={() => run(() => api.aiBottleneckAnalysis({
                    iterations: iterations.slice(0, 10),
                    orders: orders.slice(0, 10),
                    focus: 'Foxconn Zhengzhou ramp vs US near-shoring (Pegatron, Wistron) for Q2 build',
                  }))}>
                  Shenzhen vs US ramp
                </button>
                <button type="button" className={sampleBtnCls}
                  onClick={() => run(() => api.aiBottleneckAnalysis({
                    iterations: iterations.slice(0, 10),
                    orders: orders.slice(0, 10),
                    focus: 'DDR5 / capacitor (Murata, Samsung) shortage cascade across iterations',
                  }))}>
                  DDR5 / Murata shortage
                </button>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-400 text-xs">Will analyze: {iterations.length} iterations, {orders.length} orders</p>
              </div>
              <button onClick={() => run(() => api.aiBottleneckAnalysis({
                iterations: iterations.slice(0, 10),
                orders: orders.slice(0, 10)
              }))} disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
                Analyze Bottlenecks
              </button>
            </div>
          )}

          {activeTab === 'cost' && (
            <div className="space-y-4">
              <h2 className="text-white font-semibold">Cost Optimization</h2>
              <p className="text-gray-400 text-sm">Get AI-powered cost reduction strategies for your parts procurement.</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 self-center mr-1">Samples:</span>
                <button type="button" className={sampleBtnCls}
                  onClick={() => setCostPartId(findPartId('H100'))}>
                  H100 ($28,999)
                </button>
                <button type="button" className={sampleBtnCls}
                  onClick={() => setCostPartId(findPartId('Xeon'))}>
                  Xeon 8490H ($17k)
                </button>
                <button type="button" className={sampleBtnCls}
                  onClick={() => setCostPartId(findPartId('DDR5'))}>
                  DDR5 RDIMM
                </button>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Part to Optimize</label>
                <select value={costPartId} onChange={e => setCostPartId(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500">
                  <option value="">Select part...</option>
                  {parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <button onClick={() => run(() => api.aiCostOptimization({
                part: parts.find(p => String(p.id) === costPartId),
                suppliers: suppliers
              }))} disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
                Optimize Costs
              </button>
            </div>
          )}

          {activeTab === 'supplier-risk' && (
            <div className="space-y-4">
              <h2 className="text-white font-semibold">Supplier Risk Scorer</h2>
              <p className="text-gray-400 text-sm">Score operational, quality, financial and geopolitical risk for a supplier.</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 self-center mr-1">Samples:</span>
                <button type="button" className={sampleBtnCls}
                  onClick={() => setRiskSupplierId(findSupplierId('TSMC'))}>
                  TSMC (Taiwan)
                </button>
                <button type="button" className={sampleBtnCls}
                  onClick={() => setRiskSupplierId(findSupplierId('Foxconn'))}>
                  Foxconn (Taiwan)
                </button>
                <button type="button" className={sampleBtnCls}
                  onClick={() => setRiskSupplierId(findSupplierId('Murata'))}>
                  Murata (Japan)
                </button>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Supplier</label>
                <select value={riskSupplierId} onChange={e => setRiskSupplierId(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500">
                  <option value="">Select supplier...</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.country})</option>)}
                </select>
              </div>
              <button onClick={() => {
                const sup = suppliers.find(s => String(s.id) === riskSupplierId);
                if (!sup) return;
                run(() => api.aiSupplierRisk({
                  supplier: sup,
                  orders: orders.filter(o => o.supplier_id === sup.id).slice(0, 20),
                  quality_checks: quality.slice(0, 30),
                }));
              }} disabled={loading || !riskSupplierId}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
                Score Risk
              </button>
            </div>
          )}

          {activeTab === 'bom-optimizer' && (
            <div className="space-y-4">
              <h2 className="text-white font-semibold">BOM Cost Optimizer</h2>
              <p className="text-gray-400 text-sm">Enter a Bill of Materials as <code className="text-violet-300">part_id,qty</code> per line.</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 self-center mr-1">Samples:</span>
                <button type="button" className={sampleBtnCls}
                  onClick={() => setBomLines([
                    bomLineFor('H100', 8),
                    bomLineFor('EPYC', 2),
                    bomLineFor('DDR5', 32),
                  ].filter(Boolean).join('\n'))}>
                  DGX-class node
                </button>
                <button type="button" className={sampleBtnCls}
                  onClick={() => setBomLines([
                    bomLineFor('Xeon', 2),
                    bomLineFor('DDR5', 16),
                  ].filter(Boolean).join('\n'))}>
                  2P Xeon server
                </button>
                <button type="button" className={sampleBtnCls}
                  onClick={() => setBomLines([
                    bomLineFor('EPYC', 1),
                    bomLineFor('DDR5', 12),
                    bomLineFor('H100', 4),
                  ].filter(Boolean).join('\n'))}>
                  Inference node x100
                </button>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">BOM Lines</label>
                <textarea rows={6} value={bomLines} onChange={e => setBomLines(e.target.value)}
                  placeholder={'1,100\n2,10\n3,5'}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-violet-500" />
              </div>
              <div className="bg-gray-800 rounded-lg p-3 text-xs text-gray-400">
                Available part IDs: {parts.slice(0, 8).map(p => `${p.id}=${p.name}`).join(', ')}{parts.length > 8 ? '...' : ''}
              </div>
              <button onClick={() => run(() => api.aiBomOptimizer({
                bom: parseBom(),
                suppliers: suppliers,
              }))} disabled={loading || !bomLines.trim()}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
                Optimize BOM
              </button>
            </div>
          )}

          {activeTab === 'defect-predictor' && (
            <div className="space-y-4">
              <h2 className="text-white font-semibold">Quality Defect Predictor</h2>
              <p className="text-gray-400 text-sm">Predict defect rate and failure modes for the next batch.</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 self-center mr-1">Samples:</span>
                <button type="button" className={sampleBtnCls}
                  onClick={() => { setDefectPartId(findPartId('H100')); setDefectSupplierId(findSupplierId('TSMC')); }}>
                  H100 / TSMC
                </button>
                <button type="button" className={sampleBtnCls}
                  onClick={() => { setDefectPartId(findPartId('EPYC')); setDefectSupplierId(findSupplierId('Pegatron')); }}>
                  EPYC / Pegatron
                </button>
                <button type="button" className={sampleBtnCls}
                  onClick={() => { setDefectPartId(findPartId('DDR5')); setDefectSupplierId(findSupplierId('Samsung')); }}>
                  DDR5 / Samsung
                </button>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Part</label>
                <select value={defectPartId} onChange={e => setDefectPartId(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500">
                  <option value="">Select part...</option>
                  {parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Supplier</label>
                <select value={defectSupplierId} onChange={e => setDefectSupplierId(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500">
                  <option value="">Select supplier...</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <button onClick={() => {
                const part = parts.find(p => String(p.id) === defectPartId);
                if (!part) return;
                run(() => api.aiDefectPredictor({
                  part,
                  supplier: suppliers.find(s => String(s.id) === defectSupplierId),
                  quality_history: quality.filter(q => q.part_id === part.id),
                }));
              }} disabled={loading || !defectPartId}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
                Predict Defects
              </button>
            </div>
          )}

          {activeTab === 'demand-forecast' && (
            <div className="space-y-4">
              <h2 className="text-white font-semibold">Demand Forecaster</h2>
              <p className="text-gray-400 text-sm">Forecast demand for a part using historical orders.</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 self-center mr-1">Samples:</span>
                <button type="button" className={sampleBtnCls}
                  onClick={() => { setDemandPartId(findPartId('H100')); setDemandHorizon('180'); }}>
                  H100 - 180d
                </button>
                <button type="button" className={sampleBtnCls}
                  onClick={() => { setDemandPartId(findPartId('EPYC')); setDemandHorizon('90'); }}>
                  EPYC - 90d
                </button>
                <button type="button" className={sampleBtnCls}
                  onClick={() => { setDemandPartId(findPartId('DDR5')); setDemandHorizon('60'); }}>
                  DDR5 - 60d
                </button>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Part</label>
                <select value={demandPartId} onChange={e => setDemandPartId(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500">
                  <option value="">Select part...</option>
                  {parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Horizon (days)</label>
                <input type="number" value={demandHorizon} onChange={e => setDemandHorizon(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500" />
              </div>
              <button onClick={() => {
                const part = parts.find(p => String(p.id) === demandPartId);
                if (!part) return;
                run(() => api.aiDemandForecast({
                  part,
                  orders: orders.filter(o => o.part_id === part.id),
                  horizon_days: parseInt(demandHorizon) || 90,
                }));
              }} disabled={loading || !demandPartId}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
                Forecast Demand
              </button>
            </div>
          )}

          {activeTab === 'geopolitical' && (
            <div className="space-y-4">
              <h2 className="text-white font-semibold">Geopolitical Disruption Analyzer</h2>
              <p className="text-gray-400 text-sm">Assess country exposure and trade-disruption risk across your supplier base.</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 self-center mr-1">Samples:</span>
                <button type="button" className={sampleBtnCls}
                  onClick={() => setGeoFocus('Taiwan Strait crisis: TSMC wafer disruption, Foxconn/Pegatron/Wistron impact, NVIDIA H100 and Intel Xeon allocation risk')}>
                  Taiwan Strait
                </button>
                <button type="button" className={sampleBtnCls}
                  onClick={() => setGeoFocus('US export controls on advanced chips to China: H100/H800 restrictions, EUV tooling sanctions, Foxconn Zhengzhou exposure')}>
                  China export controls
                </button>
                <button type="button" className={sampleBtnCls}
                  onClick={() => setGeoFocus('Japan/Korea diversification: Murata capacitor and Samsung DDR5 sourcing as Taiwan hedge, JPY/KRW FX exposure')}>
                  JP/KR hedge
                </button>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Focus Region (optional)</label>
                <input value={geoFocus} onChange={e => setGeoFocus(e.target.value)} placeholder="e.g. China, EU, Taiwan Strait"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500" />
              </div>
              <div className="bg-gray-800 rounded-lg p-3 text-xs text-gray-400">
                Will analyze {suppliers.length} suppliers across {new Set(suppliers.map(s => s.country)).size} countries.
              </div>
              <button onClick={() => run(() => api.aiGeopolitical({
                suppliers,
                focus_region: geoFocus || null,
              }))} disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
                Analyze Geopolitical Risk
              </button>
            </div>
          )}
        </div>

        <div>
          <AIResponse content={result} loading={loading} timestamp={timestamp} />
          {!result && !loading && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <Sparkles className="w-8 h-8 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">Select a tool and run analysis to see AI insights here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
