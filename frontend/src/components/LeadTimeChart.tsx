import { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { BarChart3 } from 'lucide-react';

interface Cat {
  category: string;
  avg_lead_days: string | number;
  p90_lead_days: string | number;
  sample: string | number;
}
interface Trend {
  week: string;
  avg_actual_days: string | number;
  n_orders: string | number;
}
interface Resp {
  generated_at: string;
  categories: Cat[];
  weekly_trend: Trend[];
}

export default function LeadTimeChart() {
  const [data, setData] = useState<Resp | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    apiFetch('/custom-views/lead-time-chart')
      .then((r) => setData(r as Resp))
      .catch((e) => setErr(e.message));
  }, []);

  if (err) return <div className="text-red-400 text-sm">Failed: {err}</div>;
  if (!data) return <div className="text-gray-500 text-sm">Loading chart…</div>;

  const maxCat = Math.max(1, ...data.categories.map(c => Number(c.avg_lead_days) || 0));
  const maxTrend = Math.max(1, ...data.weekly_trend.map(t => Number(t.avg_actual_days) || 0));

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5" data-testid="lead-time-chart">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-orange-400" />
        <h3 className="text-white font-semibold text-sm">Component Lead-Time Chart</h3>
        <span className="ml-auto text-xs text-gray-500">{data.categories.length} categories</span>
      </div>

      <div className="space-y-2 mb-5">
        {data.categories.map(c => {
          const v = Number(c.avg_lead_days) || 0;
          const pct = (v / maxCat) * 100;
          return (
            <div key={c.category}>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span className="capitalize">{c.category}</span>
                <span className="text-orange-300">{v}d avg · p90 {c.p90_lead_days}d</span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <h4 className="text-xs uppercase text-gray-500 mb-2">Weekly actual lead-time</h4>
      <div className="flex items-end gap-1 h-24">
        {data.weekly_trend.length === 0 && <div className="text-gray-600 text-xs">No order history yet.</div>}
        {data.weekly_trend.map(t => {
          const v = Number(t.avg_actual_days) || 0;
          const h = (v / maxTrend) * 100;
          return (
            <div key={t.week} className="flex-1 flex flex-col items-center gap-1" title={`${t.week}: ${v}d (${t.n_orders} orders)`}>
              <div className="w-full bg-violet-500/40 rounded-t" style={{ height: `${h}%`, minHeight: '4px' }} />
              <div className="text-[9px] text-gray-600 truncate w-full text-center">{t.week.slice(5)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
