import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import {
  Package, Truck, Factory, ShoppingCart, AlertTriangle, GitBranch,
  Sparkles, Database, ScrollText, Activity, TrendingDown
} from 'lucide-react';

interface DashboardStats {
  kpis: {
    parts: number;
    suppliers: number;
    manufacturers: number;
    open_orders: number;
    quality_issues: number;
    recent_iterations: number;
    low_stock_parts: number;
    total_orders: number;
    total_iterations: number;
    total_quality_checks: number;
  };
  recent_activity: {
    id: number;
    user_email: string | null;
    action: string;
    entity_type: string | null;
    entity_id: number | null;
    details: string | null;
    created_at: string;
  }[];
}

const kpiConfig = [
  { key: 'parts', label: 'Parts', icon: Package, color: 'orange', to: '/parts' },
  { key: 'suppliers', label: 'Suppliers', icon: Truck, color: 'blue', to: '/suppliers' },
  { key: 'manufacturers', label: 'Manufacturers', icon: Factory, color: 'cyan', to: '/manufacturers' },
  { key: 'open_orders', label: 'Open Orders', icon: ShoppingCart, color: 'yellow', to: '/orders' },
  { key: 'quality_issues', label: 'Quality Issues', icon: AlertTriangle, color: 'red', to: '/quality' },
  { key: 'recent_iterations', label: 'Recent Iterations (30d)', icon: GitBranch, color: 'violet', to: '/iterations' },
] as const;

const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
  orange: { bg: 'bg-orange-600/10', text: 'text-orange-400', ring: 'ring-orange-600/30' },
  blue: { bg: 'bg-blue-600/10', text: 'text-blue-400', ring: 'ring-blue-600/30' },
  cyan: { bg: 'bg-cyan-600/10', text: 'text-cyan-400', ring: 'ring-cyan-600/30' },
  yellow: { bg: 'bg-yellow-600/10', text: 'text-yellow-400', ring: 'ring-yellow-600/30' },
  red: { bg: 'bg-red-600/10', text: 'text-red-400', ring: 'ring-red-600/30' },
  violet: { bg: 'bg-violet-600/10', text: 'text-violet-400', ring: 'ring-violet-600/30' },
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diffMs / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    api.getDashboardStats()
      .then((r) => setStats(r as DashboardStats))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Welcome back{user.name ? `, ${user.name}` : ''} - HardwareOS supply chain overview
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3 mb-6">
          Failed to load dashboard: {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {kpiConfig.map(({ key, label, icon: Icon, color, to }) => {
          const c = colorMap[color];
          const value = stats?.kpis[key] ?? '-';
          return (
            <Link
              key={key}
              to={to}
              className={`bg-gray-900 border border-gray-800 rounded-xl p-4 hover:ring-2 hover:${c.ring} transition-all`}
            >
              <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${c.text}`} />
              </div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-gray-500 mt-1">{label}</div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-yellow-400" />
            <h3 className="text-white font-semibold text-sm">Low Stock Parts</h3>
          </div>
          <div className="text-3xl font-bold text-yellow-400">{stats?.kpis.low_stock_parts ?? '-'}</div>
          <p className="text-xs text-gray-500 mt-1">parts at or below reorder threshold</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingCart className="w-4 h-4 text-blue-400" />
            <h3 className="text-white font-semibold text-sm">Total Orders</h3>
          </div>
          <div className="text-3xl font-bold text-white">{stats?.kpis.total_orders ?? '-'}</div>
          <p className="text-xs text-gray-500 mt-1">all-time order records</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <GitBranch className="w-4 h-4 text-violet-400" />
            <h3 className="text-white font-semibold text-sm">Iterations / QC</h3>
          </div>
          <div className="text-3xl font-bold text-white">
            {stats?.kpis.total_iterations ?? '-'}<span className="text-gray-500 text-lg"> / {stats?.kpis.total_quality_checks ?? '-'}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">design iterations / quality checks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl">
          <div className="p-5 border-b border-gray-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-400" />
            <h3 className="text-white font-semibold text-sm">Recent Activity</h3>
            <Link to="/audit" className="ml-auto text-xs text-gray-500 hover:text-orange-400">View all</Link>
          </div>
          <div className="divide-y divide-gray-800">
            {!stats && <div className="p-5 text-gray-500 text-sm">Loading activity...</div>}
            {stats && stats.recent_activity.length === 0 && (
              <div className="p-5 text-gray-500 text-sm">No recent activity</div>
            )}
            {stats?.recent_activity.map((a) => (
              <div key={a.id} className="p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <ScrollText className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white">
                    <span className="font-medium">{a.action}</span>
                    {a.entity_type && <span className="text-gray-400"> on {a.entity_type}{a.entity_id ? ` #${a.entity_id}` : ''}</span>}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 flex gap-2">
                    <span>{a.user_email || 'system'}</span>
                    <span>-</span>
                    <span>{timeAgo(a.created_at)}</span>
                  </div>
                  {a.details && (
                    <div className="text-xs text-gray-400 mt-1 truncate">{a.details}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl">
          <div className="p-5 border-b border-gray-800">
            <h3 className="text-white font-semibold text-sm">Quick Actions</h3>
          </div>
          <div className="p-3 space-y-1">
            <Link to="/ai" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-violet-600/10 hover:text-violet-300 transition-colors">
              <Sparkles className="w-4 h-4 text-violet-400" />
              AI Center
            </Link>
            <Link to="/parts" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-orange-600/10 hover:text-orange-300 transition-colors">
              <Package className="w-4 h-4 text-orange-400" />
              Parts Catalog
            </Link>
            <Link to="/suppliers" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-blue-600/10 hover:text-blue-300 transition-colors">
              <Truck className="w-4 h-4 text-blue-400" />
              Suppliers
            </Link>
            <Link to="/sample-data" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-emerald-600/10 hover:text-emerald-300 transition-colors">
              <Database className="w-4 h-4 text-emerald-400" />
              Sample Data
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
