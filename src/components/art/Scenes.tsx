import { cn } from '@/lib/utils'

/** Storefront placeholder for store detail / cards */
export function StoreArt({ color, name, className }: { color: string; name: string; className?: string }) {
  const sign = name.split(' ')[0]
  return (
    <div className={cn('relative overflow-hidden grayscale', className)} style={{ background: '#2B2B2B' }}>
      <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <rect width="400" height="260" fill="#30333B" />
        <rect x="0" y="0" width="400" height="60" fill={color} />
        <text x="200" y="40" textAnchor="middle" fontSize="26" fontWeight="900" fill={color === '#2A2A2C' ? '#fff' : '#141413'} fontFamily="Pretendard Variable, sans-serif">
          {sign}
        </text>
        {Array.from({ length: 10 }).map((_, i) => (
          <path key={i} d={`M${i * 40} 60 h40 l-6 22 h-28 z`} fill={i % 2 ? '#fff' : color} opacity={i % 2 ? 0.9 : 1} />
        ))}
        <rect x="40" y="100" width="140" height="160" rx="4" fill="#FCE9B8" opacity="0.92" />
        <rect x="220" y="100" width="140" height="160" rx="4" fill="#FCE9B8" opacity="0.92" />
        {[0, 1, 2].map((r) =>
          [0, 1, 2, 3, 4, 5].map((c) => (
            <rect key={`${r}${c}`} x={52 + c * 21 + (c > 2 ? 140 : 0) + (c > 2 ? 16 : 0)} y={118 + r * 40} width="14" height="26" rx="3" fill={['#E8453C', '#86A8F0', '#F2C94C', '#9AC7B5', '#F4A7C0'][(r + c) % 5]} />
          )),
        )}
        <rect x="186" y="120" width="28" height="140" fill="#1E2026" />
      </svg>
    </div>
  )
}

/** Small skyline badge for city cards */
export function CityArt({ hue, sky, className }: { hue: string; sky: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 90" className={cn('rounded-2xl grayscale', className)} aria-hidden>
      <rect width="120" height="90" fill={sky} />
      <circle cx="88" cy="28" r="12" fill="#fff" opacity="0.8" />
      <rect x="10" y="48" width="16" height="42" fill={hue} opacity="0.55" />
      <rect x="28" y="36" width="14" height="54" fill={hue} opacity="0.8" />
      <path d="M56 90 V44 L62 20 L68 44 V90 Z" fill={hue} />
      <rect x="72" y="54" width="18" height="36" fill={hue} opacity="0.6" />
      <rect x="92" y="42" width="18" height="48" fill={hue} opacity="0.85" />
      <rect x="0" y="84" width="120" height="6" fill={hue} />
    </svg>
  )
}
