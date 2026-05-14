interface Iteration {
  version: string
  changes: string
  durationHours: number
  date: string
  engineer: string
}

interface PartIterations {
  partName: string
  partNumber: string
  iterations: Iteration[]
}

const data: PartIterations[] = [
  {
    partName: 'Custom PCBA',
    partNumber: 'PCB-023',
    iterations: [
      {
        version: 'v1.0',
        changes: 'Initial design — STM32H7 with USB-C, I2C, SPI busses. 4-layer stackup.',
        durationHours: 8,
        date: '2026-03-15',
        engineer: 'Alex K.',
      },
      {
        version: 'v1.1',
        changes: 'Fixed decoupling cap placement near VDDA pin, moved crystal closer to MCU. Added testpoints.',
        durationHours: 32,
        date: '2026-03-22',
        engineer: 'Alex K.',
      },
      {
        version: 'v2.0',
        changes: 'Upgraded to 6-layer stackup for better EMI. Added power monitoring via INA260. Redesigned USB ESD protection.',
        durationHours: 14,
        date: '2026-04-10',
        engineer: 'Maria L.',
      },
      {
        version: 'v2.3',
        changes: 'Minor footprint correction on USB connector, added pull-down on BOOT0 pin.',
        durationHours: 3,
        date: '2026-04-20',
        engineer: 'Alex K.',
      },
    ],
  },
  {
    partName: 'Aluminum Enclosure',
    partNumber: 'ENC-007',
    iterations: [
      {
        version: 'v1.0',
        changes: 'Initial billet machining spec — 6061-T6, 4 M3 mounting holes, cutout for USB-C.',
        durationHours: 6,
        date: '2026-04-01',
        engineer: 'Tom H.',
      },
      {
        version: 'v1.1',
        changes: 'Added ventilation slots on side panel after thermal analysis showed hotspot at 85°C ambient.',
        durationHours: 26,
        date: '2026-04-12',
        engineer: 'Tom H.',
      },
      {
        version: 'v2.0',
        changes: 'Redesigned lid attachment from 4-screw to snap-fit + 2-screw. Added ground tab for ESD.',
        durationHours: 18,
        date: '2026-04-25',
        engineer: 'Sarah M.',
      },
    ],
  },
  {
    partName: 'Sensor Array Module',
    partNumber: 'SEN-012',
    iterations: [
      {
        version: 'v1.0',
        changes: 'IMU (ICM-42688) + ToF (VL53L5CX) + barometer (BMP388) first layout pass.',
        durationHours: 10,
        date: '2026-04-18',
        engineer: 'Priya N.',
      },
      {
        version: 'v1.1',
        changes: 'Increased ground plane isolation between ToF IR emitter and IMU. Fixed I2C address conflict.',
        durationHours: 48,
        date: '2026-04-28',
        engineer: 'Priya N.',
      },
    ],
  },
]

const SHENZHEN_THRESHOLD_HOURS = 24

export default function IterationTracker() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Iteration Tracker</h2>
          <p className="text-gray-500 text-sm mt-0.5">Design iteration history by part — iterations over 24h highlighted</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-yellow-50 border border-yellow-200 px-3 py-2 rounded-lg text-yellow-700">
          <span className="w-3 h-3 bg-yellow-400 rounded-sm inline-block" />
          &gt;24h = Shenzhen gap
        </div>
      </div>

      <div className="space-y-6">
        {data.map(part => (
          <div key={part.partNumber} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{part.partName}</h3>
                <span className="text-xs text-gray-400 font-mono">{part.partNumber}</span>
              </div>
              <div className="text-sm text-gray-500">
                {part.iterations.length} iterations · {' '}
                <span className={part.iterations.some(i => i.durationHours > SHENZHEN_THRESHOLD_HOURS) ? 'text-yellow-600 font-medium' : 'text-gray-400'}>
                  {part.iterations.filter(i => i.durationHours > SHENZHEN_THRESHOLD_HOURS).length} slow
                </span>
              </div>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-gray-100" />

              {part.iterations.map((iter, i) => {
                const isSlow = iter.durationHours > SHENZHEN_THRESHOLD_HOURS
                return (
                  <div key={iter.version} className={`relative flex gap-4 px-5 py-4 ${i < part.iterations.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center" style={{ width: 28 }}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold z-10 bg-white ${
                        i === part.iterations.length - 1
                          ? 'border-blue-600 text-blue-600'
                          : 'border-gray-300 text-gray-400'
                      }`}>
                        {i + 1}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="font-bold text-gray-800 text-sm">{iter.version}</span>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                            isSlow
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              : 'bg-green-50 text-green-700 border-green-200'
                          }`}
                        >
                          {isSlow ? '⚠ ' : ''}{iter.durationHours}h
                          {isSlow ? ' (Shenzhen gap)' : ''}
                        </span>
                        <span className="text-xs text-gray-400 ml-auto">
                          {new Date(iter.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {iter.engineer}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{iter.changes}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
