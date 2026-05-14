const SHENZHEN_BENCHMARK_HOURS = 24

const iterationData = [
  { part: 'Custom PCBA', iterations: [8, 32, 14, 3] },
  { part: 'Aluminum Enclosure', iterations: [6, 26, 18] },
  { part: 'Sensor Array', iterations: [10, 48] },
  { part: 'Flex PCB Harness', iterations: [4, 12, 8, 6] },
  { part: 'BLDC Motor', iterations: [3, 18] },
  { part: 'Battery Pack', iterations: [22, 44, 9] },
  { part: 'Gear Assembly', iterations: [5, 15, 28, 11] },
  { part: 'Power IC', iterations: [2, 6, 3] },
]

const allIterations = iterationData.flatMap(d => d.iterations)
const totalIterations = allIterations.length
const avgHours = allIterations.reduce((a, b) => a + b, 0) / totalIterations
const avgDays = avgHours / 24
const gapMultiplier = avgHours / SHENZHEN_BENCHMARK_HOURS
const onTimeCount = iterationData.filter(d => {
  const avg = d.iterations.reduce((a, b) => a + b, 0) / d.iterations.length
  return avg <= 24
}).length
const onTimeRate = Math.round((onTimeCount / iterationData.length) * 100)

const bottleneckStages: { stage: string; avgHours: number }[] = [
  { stage: 'PCB Layout Review', avgHours: 18.4 },
  { stage: 'DFM Sign-off', avgHours: 32.1 },
  { stage: 'BOM Sourcing', avgHours: 24.7 },
  { stage: 'Mechanical CAD', avgHours: 15.2 },
  { stage: 'Firmware Integration', avgHours: 38.9 },
  { stage: 'Proto Assembly', avgHours: 12.0 },
]

const maxBottleneck = Math.max(...bottleneckStages.map(s => s.avgHours))

export default function MetricsDashboard() {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">Metrics Dashboard</h2>
        <p className="text-gray-500 text-sm mt-0.5">Iteration speed vs. Shenzhen benchmark (24h per iteration)</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Avg Iteration Time</div>
          <div className="text-3xl font-bold text-gray-900">{avgDays.toFixed(1)}<span className="text-lg text-gray-400 font-normal ml-1">days</span></div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-xs text-gray-400">vs</span>
            <span className="text-xs font-medium text-blue-600">1 day Shenzhen</span>
          </div>
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-red-400 rounded-full" style={{ width: `${Math.min(100, (avgDays / 5) * 100)}%` }} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">On-Time Rate</div>
          <div className="text-3xl font-bold text-gray-900">{onTimeRate}<span className="text-lg text-gray-400 font-normal ml-0.5">%</span></div>
          <div className="text-xs text-gray-400 mt-2">Parts within 24h avg</div>
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: `${onTimeRate}%` }} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Parts Tracked</div>
          <div className="text-3xl font-bold text-gray-900">8</div>
          <div className="text-xs text-gray-400 mt-2">{totalIterations} iterations total</div>
        </div>

        <div className="bg-white border border-red-200 bg-red-50 rounded-xl p-5 shadow-sm">
          <div className="text-xs text-red-500 uppercase tracking-wide mb-1">Gap Multiplier</div>
          <div className="text-4xl font-bold text-red-600">{gapMultiplier.toFixed(1)}x</div>
          <div className="text-xs text-red-400 mt-2">slower than Shenzhen</div>
        </div>
      </div>

      {/* Gap visual */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Iteration Time vs. Shenzhen Benchmark</h3>
        <div className="space-y-3">
          {iterationData.map(d => {
            const avg = d.iterations.reduce((a, b) => a + b, 0) / d.iterations.length
            const isFast = avg <= 24
            return (
              <div key={d.part}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600 font-medium w-40">{d.part}</span>
                  <span className={`font-bold ${isFast ? 'text-green-600' : 'text-red-500'}`}>
                    {avg.toFixed(1)}h avg
                  </span>
                </div>
                <div className="relative h-5 bg-gray-100 rounded-full overflow-hidden">
                  {/* Shenzhen target line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-blue-400 z-10"
                    style={{ left: `${(24 / 60) * 100}%` }}
                  />
                  <div
                    className={`h-full rounded-full ${isFast ? 'bg-green-400' : 'bg-red-400'}`}
                    style={{ width: `${Math.min(100, (avg / 60) * 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
            <div className="w-0.5 h-4 bg-blue-400 inline-block" />
            24h Shenzhen benchmark
          </div>
        </div>
      </div>

      {/* Bottleneck stages */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Bottleneck Stages (Avg Hours)</h3>
        <div className="space-y-3">
          {bottleneckStages.sort((a, b) => b.avgHours - a.avgHours).map(stage => (
            <div key={stage.stage}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-700">{stage.stage}</span>
                <span className={`font-bold text-xs ${stage.avgHours > 30 ? 'text-red-500' : stage.avgHours > 20 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {stage.avgHours}h
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${stage.avgHours > 30 ? 'bg-red-400' : stage.avgHours > 20 ? 'bg-yellow-400' : 'bg-green-400'}`}
                  style={{ width: `${(stage.avgHours / maxBottleneck) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
