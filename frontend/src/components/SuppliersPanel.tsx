interface Supplier {
  id: number
  name: string
  location: string
  flag: string
  capabilities: string[]
  leadTime: string
  rating: number
  contact: { name: string; email: string; phone: string }
  certifications: string[]
  minOrderQty: string
  pricing: 'budget' | 'mid' | 'premium'
}

const suppliers: Supplier[] = [
  {
    id: 1,
    name: 'PCBWay',
    location: 'Shenzhen, China',
    flag: '🇨🇳',
    capabilities: ['PCB Fabrication', 'PCBA Assembly', 'SMT', 'THT', 'Stencil Cutting'],
    leadTime: '5–12 days',
    rating: 4.5,
    contact: { name: 'Linda Chen', email: 'linda@pcbway.com', phone: '+86 755-2345-6789' },
    certifications: ['ISO 9001', 'UL', 'RoHS'],
    minOrderQty: '5 PCBs',
    pricing: 'budget',
  },
  {
    id: 2,
    name: 'Xometry',
    location: 'North Bethesda, MD, USA',
    flag: '🇺🇸',
    capabilities: ['CNC Machining', 'Sheet Metal', '3D Printing', 'Injection Molding', 'Casting'],
    leadTime: '3–18 days',
    rating: 4.7,
    contact: { name: 'James Walker', email: 'jwalker@xometry.com', phone: '+1 800-886-3238' },
    certifications: ['ISO 9001', 'AS9100', 'ITAR'],
    minOrderQty: '1 part',
    pricing: 'mid',
  },
  {
    id: 3,
    name: 'JLCPCB',
    location: 'Shenzhen, China',
    flag: '🇨🇳',
    capabilities: ['PCB Fabrication', 'SMT Assembly', 'Flex PCB', 'Rigid-Flex', 'HDI'],
    leadTime: '2–7 days',
    rating: 4.4,
    contact: { name: 'Kevin Liu', email: 'support@jlcpcb.com', phone: '+86 755-8888-9999' },
    certifications: ['ISO 9001', 'IATF 16949', 'RoHS'],
    minOrderQty: '5 PCBs',
    pricing: 'budget',
  },
  {
    id: 4,
    name: 'Arrow Electronics',
    location: 'Centennial, CO, USA',
    flag: '🇺🇸',
    capabilities: ['Component Distribution', 'IC Sourcing', 'VMI Services', 'Engineering Support'],
    leadTime: '1–5 days (in stock)',
    rating: 4.2,
    contact: { name: 'Sarah Mitchell', email: 'smitchell@arrow.com', phone: '+1 303-824-4000' },
    certifications: ['ISO 9001', 'AS6081'],
    minOrderQty: 'Per component',
    pricing: 'mid',
  },
]

const pricingLabel: Record<Supplier['pricing'], { label: string; color: string }> = {
  budget: { label: '$', color: 'text-green-600 bg-green-50 border-green-200' },
  mid: { label: '$$', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  premium: { label: '$$$', color: 'text-red-600 bg-red-50 border-red-200' },
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={`text-sm ${star <= Math.floor(rating) ? 'text-yellow-400' : star - 0.5 <= rating ? 'text-yellow-300' : 'text-gray-200'}`}
        >
          ★
        </span>
      ))}
      <span className="text-sm text-gray-500 ml-1">{rating}</span>
    </div>
  )
}

export default function SuppliersPanel() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Suppliers</h2>
          <p className="text-gray-500 text-sm mt-0.5">{suppliers.length} approved suppliers in network</p>
        </div>
        <button className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Add Supplier
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {suppliers.map(s => (
          <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{s.flag}</span>
                  <h3 className="font-bold text-gray-900 text-lg">{s.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded border font-bold ${pricingLabel[s.pricing].color}`}>
                    {pricingLabel[s.pricing].label}
                  </span>
                </div>
                <div className="text-sm text-gray-500">{s.location}</div>
                <div className="mt-1">
                  <StarRating rating={s.rating} />
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Lead time</div>
                <div className="font-semibold text-gray-800 text-sm">{s.leadTime}</div>
                <div className="text-xs text-gray-400 mt-1">MOQ: {s.minOrderQty}</div>
              </div>
            </div>

            {/* Capabilities */}
            <div className="mb-3">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">Capabilities</div>
              <div className="flex flex-wrap gap-1.5">
                {s.capabilities.map(cap => (
                  <span key={cap} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md">
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="mb-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">Certifications</div>
              <div className="flex flex-wrap gap-1.5">
                {s.certifications.map(cert => (
                  <span key={cert} className="text-xs bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-md font-medium">
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="border-t border-gray-100 pt-3">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">Contact</div>
              <div className="text-sm text-gray-700 font-medium">{s.contact.name}</div>
              <div className="flex items-center gap-4 mt-1">
                <a href={`mailto:${s.contact.email}`} className="text-xs text-blue-600 hover:underline">
                  {s.contact.email}
                </a>
                <span className="text-xs text-gray-400">{s.contact.phone}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
