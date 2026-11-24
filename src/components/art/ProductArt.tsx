import type { Art } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * Product "cutout": placeholder packaging illustration that floats on its surface.
 * tone: neutral (soft gray square) · none (transparent, for white cards) · color (tinted).
 * Pass `image` (a background-removed PNG) to show a real product photo instead.
 */
export function ProductArt({
  art,
  className,
  tone = 'neutral',
  image,
  tilt = 0,
}: {
  art: Art
  className?: string
  tone?: 'neutral' | 'none' | 'color'
  image?: string
  tilt?: number
}) {
  const bg = tone === 'neutral' ? '#F4F4F2' : tone === 'color' ? art.bg : undefined
  return (
    <div className={cn('relative grid place-items-center overflow-hidden', className)} style={{ background: bg }}>
      {image ? (
        <img src={image} alt="" className="h-[82%] w-[82%] object-contain drop-shadow-[0_14px_14px_rgba(20,20,19,0.18)]" style={{ rotate: `${tilt}deg` }} />
      ) : (
        <svg viewBox="0 0 200 200" className="h-[84%] w-[84%] drop-shadow-[0_14px_12px_rgba(20,20,19,0.16)]" style={{ rotate: `${tilt}deg` }} aria-hidden>
          <Shape shape={art.shape} color={art.color} accent={art.accent} />
        </svg>
      )}
    </div>
  )
}

function Shape({ shape, color, accent }: { shape: Art['shape']; color: string; accent: string }) {
  const shade = <rect width="200" height="200" fill="#000" opacity="0" />
  switch (shape) {
    case 'box':
      return (
        <g>
          <polygon points="46,62 68,44 166,44 144,62" fill={color} />
          <polygon points="46,62 68,44 166,44 144,62" fill="#fff" opacity="0.35" />
          <polygon points="144,62 166,44 166,150 144,168" fill={color} />
          <polygon points="144,62 166,44 166,150 144,168" fill="#000" opacity="0.16" />
          <rect x="46" y="62" width="98" height="106" fill={color} />
          <rect x="46" y="128" width="98" height="14" fill={accent} opacity="0.9" />
          <circle cx="95" cy="98" r="22" fill={accent} />
          <circle cx="95" cy="98" r="12" fill={color} opacity="0.9" />
          <rect x="54" y="68" width="6" height="94" fill="#fff" opacity="0.25" />
        </g>
      )
    case 'tube':
      return (
        <g transform="rotate(-10 100 100)">
          <rect x="70" y="26" width="60" height="12" rx="2" fill={color} />
          <rect x="70" y="26" width="60" height="12" rx="2" fill="#000" opacity="0.12" />
          <path d="M66 38 H134 L126 150 H74 Z" fill={color} />
          <rect x="80" y="72" width="40" height="46" rx="6" fill={accent} />
          <rect x="86" y="80" width="28" height="5" rx="2.5" fill={color} opacity="0.7" />
          <rect x="86" y="90" width="20" height="4" rx="2" fill={color} opacity="0.45" />
          <rect x="80" y="150" width="40" height="24" rx="5" fill="#1d1d1f" />
          <rect x="72" y="40" width="7" height="104" fill="#fff" opacity="0.35" />
        </g>
      )
    case 'bottle':
      return (
        <g>
          <rect x="84" y="30" width="32" height="24" rx="6" fill={accent} />
          <rect x="89" y="52" width="22" height="18" fill={color} />
          <rect x="89" y="52" width="22" height="18" fill="#000" opacity="0.15" />
          <rect x="64" y="68" width="72" height="104" rx="20" fill={color} />
          <rect x="72" y="98" width="56" height="48" rx="8" fill="#fff" opacity="0.92" />
          <rect x="80" y="108" width="40" height="6" rx="3" fill={color} />
          <rect x="80" y="120" width="28" height="4" rx="2" fill={color} opacity="0.55" />
          <rect x="72" y="76" width="7" height="88" rx="3.5" fill="#fff" opacity="0.35" />
          {shade}
        </g>
      )
    case 'pouch':
      return (
        <g>
          <path d="M54 48 H146 L152 162 Q100 174 48 162 Z" fill={color} />
          <rect x="54" y="40" width="92" height="12" rx="3" fill={color} />
          <rect x="54" y="40" width="92" height="12" rx="3" fill="#000" opacity="0.18" />
          <circle cx="100" cy="108" r="26" fill={accent} opacity="0.95" />
          <circle cx="92" cy="104" r="6" fill={color} opacity="0.5" />
          <circle cx="106" cy="114" r="5" fill={color} opacity="0.4" />
          <path d="M62 56 L58 150" stroke="#fff" strokeOpacity="0.35" strokeWidth="7" strokeLinecap="round" />
        </g>
      )
    case 'jar':
      return (
        <g>
          <rect x="54" y="92" width="92" height="66" rx="18" fill={color} />
          <rect x="54" y="92" width="92" height="66" rx="18" fill="#000" opacity="0.06" />
          <rect x="50" y="68" width="100" height="30" rx="15" fill={accent} />
          <ellipse cx="100" cy="72" rx="40" ry="6" fill="#fff" opacity="0.5" />
          <rect x="74" y="112" width="52" height="26" rx="13" fill="#fff" opacity="0.8" />
          <rect x="62" y="100" width="6" height="50" rx="3" fill="#fff" opacity="0.4" />
        </g>
      )
    case 'towel':
      return (
        <g transform="rotate(-6 100 100)">
          <rect x="48" y="58" width="104" height="104" rx="8" fill={color} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x="48" y={128 + i * 9} width="104" height="4" fill={accent} opacity="0.85" />
          ))}
          <path d="M48 58 L100 58 L48 110 Z" fill="#fff" opacity="0.22" />
          <rect x="62" y="70" width="34" height="14" rx="4" fill={accent} opacity="0.9" />
        </g>
      )
    case 'can':
      return (
        <g>
          <rect x="70" y="44" width="60" height="122" rx="12" fill={color} />
          <ellipse cx="100" cy="46" rx="30" ry="7" fill="#d9d9dc" />
          <ellipse cx="100" cy="46" rx="22" ry="4" fill="#bdbdc2" />
          <rect x="70" y="92" width="60" height="34" fill={accent} />
          <circle cx="100" cy="109" r="10" fill={color} />
          <rect x="76" y="54" width="7" height="104" rx="3.5" fill="#fff" opacity="0.32" />
        </g>
      )
    case 'bar':
      return (
        <g transform="rotate(-12 100 110)">
          <rect x="32" y="82" width="136" height="56" rx="10" fill={color} />
          <rect x="32" y="82" width="16" height="56" rx="4" fill="#000" opacity="0.12" />
          <rect x="152" y="82" width="16" height="56" rx="4" fill="#000" opacity="0.12" />
          <rect x="66" y="94" width="58" height="32" rx="16" fill={accent} />
          <rect x="78" y="106" width="34" height="8" rx="4" fill="#fff" opacity="0.9" />
          <rect x="48" y="86" width="104" height="5" rx="2.5" fill="#fff" opacity="0.3" />
        </g>
      )
  }
}
