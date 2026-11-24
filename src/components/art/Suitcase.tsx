import type { SuitcaseModel } from '@/lib/types'
import { cn } from '@/lib/utils'

function isDark(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return 0.299 * r + 0.587 * g + 0.114 * b < 110
}

/** Hard-shell suitcase illustration. Body area (for stickers) is roughly x 8–92%, y 12–92% of the box. */
export function Suitcase({ color, model = 'ribbed', className, id }: { color: string; model?: SuitcaseModel; className?: string; id?: string }) {
  const dark = isDark(color)
  const line = dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.10)'
  const gid = `sc-${id ?? 'x'}-${color.replace('#', '')}`
  return (
    <svg viewBox="0 0 240 340" className={cn('drop-shadow-[0_24px_30px_rgba(20,20,19,0.18)]', className)} aria-hidden>
      <defs>
        <linearGradient id={`${gid}-g`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={dark ? 0.16 : 0.5} />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.8" stopColor="#000" stopOpacity="0.06" />
          <stop offset="1" stopColor="#000" stopOpacity="0.16" />
        </linearGradient>
      </defs>
      {/* trolley handle */}
      <rect x="86" y="4" width="68" height="14" rx="7" fill="none" stroke={dark ? '#4a4a4d' : '#a9abb0'} strokeWidth="8" />
      <rect x="94" y="16" width="8" height="26" rx="2" fill={dark ? '#4a4a4d' : '#a9abb0'} />
      <rect x="138" y="16" width="8" height="26" rx="2" fill={dark ? '#4a4a4d' : '#a9abb0'} />
      {/* wheels */}
      {[52, 188].map((x) => (
        <g key={x}>
          <rect x={x - 9} y="300" width="18" height="16" rx="4" fill={dark ? '#3a3a3c' : '#8f9196'} />
          <circle cx={x} cy="322" r="13" fill="#2a2a2c" />
          <circle cx={x} cy="322" r="5" fill="#d9d9dc" />
        </g>
      ))}
      {/* body */}
      <rect x="18" y="38" width="204" height="268" rx="28" fill={color} />
      <rect x="18" y="38" width="204" height="268" rx="28" fill={`url(#${gid}-g)`} />
      {model === 'ribbed' &&
        Array.from({ length: 7 }).map((_, i) => (
          <g key={i}>
            <line x1="22" x2="218" y1={72 + i * 34} y2={72 + i * 34} stroke={line} strokeWidth="3" />
            <line x1="22" x2="218" y1={75 + i * 34} y2={75 + i * 34} stroke="#fff" strokeOpacity={dark ? 0.06 : 0.35} strokeWidth="1.5" />
          </g>
        ))}
      {model === 'classic' &&
        [70, 120, 170].map((x) => (
          <g key={x}>
            <line x1={x} x2={x} y1="46" y2="298" stroke={line} strokeWidth="4" strokeLinecap="round" />
            <line x1={x + 3} x2={x + 3} y1="46" y2="298" stroke="#fff" strokeOpacity={dark ? 0.06 : 0.3} strokeWidth="1.5" strokeLinecap="round" />
          </g>
        ))}
      {model === 'soft' && (
        <g>
          <rect x="40" y="150" width="160" height="130" rx="22" fill="none" stroke={line} strokeWidth="3" />
          <path d="M44 162 H196" stroke={line} strokeWidth="2" strokeDasharray="4 4" />
        </g>
      )}
      {/* corner guards + side handle */}
      <rect x="12" y="150" width="10" height="56" rx="5" fill={dark ? '#3a3a3c' : '#b8babf'} />
      {[
        [26, 46],
        [204, 46],
        [26, 288],
        [204, 288],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill={dark ? '#555' : '#9ea0a5'} />
      ))}
    </svg>
  )
}
