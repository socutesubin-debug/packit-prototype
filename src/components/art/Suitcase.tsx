import type { SuitcaseModel } from '@/lib/types'
import { cn } from '@/lib/utils'

function rgb(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function mix(hex: string, to: number, t: number) {
  const [r, g, b] = rgb(hex)
  const f = (c: number) => Math.round(c + (to - c) * t)
  return `rgb(${f(r)},${f(g)},${f(b)})`
}
const light = (h: string, t: number) => mix(h, 255, t)
const dark = (h: string, t: number) => mix(h, 0, t)
function isDark(hex: string) {
  const [r, g, b] = rgb(hex)
  return 0.299 * r + 0.587 * g + 0.114 * b < 110
}

/**
 * Hard-shell suitcase, rendered with metallic shading.
 * Sticker coordinates are percentages of the whole 240×340 box; the shell spans roughly x 8–92%, y 12–90%.
 */
export function Suitcase({ color, model = 'ribbed', className, id }: { color: string; model?: SuitcaseModel; className?: string; id?: string }) {
  const k = `sc-${id ?? 'x'}-${color.replace('#', '')}`
  const d = isDark(color)
  const hw = d ? '#3a3a3d' : '#b9bcc2' // hardware
  const hwHi = d ? '#5a5a5e' : '#e9ebee'
  const hwLo = d ? '#1d1d1f' : '#8e9197'
  return (
    <svg viewBox="0 0 240 340" className={cn('drop-shadow-[0_30px_28px_rgba(20,20,19,0.20)]', className)} aria-hidden>
      <defs>
        <linearGradient id={`${k}-body`} x1="0" x2="1">
          <stop offset="0" stopColor={light(color, d ? 0.12 : 0.55)} />
          <stop offset="0.12" stopColor={light(color, d ? 0.06 : 0.25)} />
          <stop offset="0.45" stopColor={color} />
          <stop offset="0.82" stopColor={dark(color, 0.1)} />
          <stop offset="1" stopColor={dark(color, 0.28)} />
        </linearGradient>
        <linearGradient id={`${k}-rod`} x1="0" x2="1">
          <stop offset="0" stopColor={hwLo} />
          <stop offset="0.4" stopColor={hwHi} />
          <stop offset="1" stopColor={hwLo} />
        </linearGradient>
        <radialGradient id={`${k}-sheen`} cx="0.25" cy="0.12" r="0.7">
          <stop offset="0" stopColor="#fff" stopOpacity={d ? 0.18 : 0.55} />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${k}-clip`}>
          <rect x="20" y="40" width="200" height="266" rx="26" />
        </clipPath>
      </defs>

      {/* telescopic handle */}
      <rect x="92" y="14" width="9" height="34" fill={`url(#${k}-rod)`} />
      <rect x="139" y="14" width="9" height="34" fill={`url(#${k}-rod)`} />
      <rect x="84" y="2" width="72" height="17" rx="8.5" fill={hwLo} />
      <rect x="86" y="3.5" width="68" height="10" rx="5" fill={hwHi} opacity="0.7" />

      {/* spinner wheels */}
      {[46, 194].map((x) => (
        <g key={x}>
          <path d={`M${x - 16} 300 h32 v10 a6 6 0 0 1 -6 6 h-20 a6 6 0 0 1 -6 -6z`} fill={hw} />
          {[x - 8, x + 8].map((wx) => (
            <g key={wx}>
              <circle cx={wx} cy="324" r="10" fill="#1c1c1e" />
              <circle cx={wx} cy="324" r="4.5" fill="#cfd1d5" />
              <circle cx={wx - 2} cy="321" r="2.5" fill="#fff" opacity="0.35" />
            </g>
          ))}
        </g>
      ))}

      {/* shell */}
      <rect x="20" y="40" width="200" height="266" rx="26" fill={`url(#${k}-body)`} />
      <g clipPath={`url(#${k}-clip)`}>
        {model === 'ribbed' &&
          Array.from({ length: 9 }).map((_, i) => {
            const y = 62 + i * 28
            return (
              <g key={i}>
                <rect x="20" y={y} width="200" height="5" fill={dark(color, d ? 0.35 : 0.18)} opacity="0.55" />
                <rect x="20" y={y + 5} width="200" height="2.5" fill="#fff" opacity={d ? 0.12 : 0.6} />
              </g>
            )
          })}
        {model === 'classic' &&
          [74, 120, 166].map((x) => (
            <g key={x}>
              <rect x={x - 6} y="40" width="12" height="266" rx="6" fill={dark(color, 0.12)} opacity="0.35" />
              <rect x={x - 6} y="40" width="4" height="266" fill="#fff" opacity={d ? 0.1 : 0.5} />
            </g>
          ))}
        {model === 'soft' && (
          <g>
            <rect x="38" y="148" width="164" height="140" rx="24" fill={dark(color, 0.06)} />
            <rect x="38" y="148" width="164" height="140" rx="24" fill="none" stroke={dark(color, 0.2)} strokeWidth="2" />
            <path d="M46 162 H194" stroke={dark(color, 0.3)} strokeWidth="2" strokeDasharray="3 4" />
          </g>
        )}
        <rect x="20" y="40" width="200" height="266" fill={`url(#${k}-sheen)`} />
        {/* shell seam */}
        <rect x="20" y="40" width="4" height="266" fill={dark(color, 0.25)} opacity="0.5" />
      </g>
      <rect x="20.5" y="40.5" width="199" height="265" rx="25.5" fill="none" stroke={dark(color, 0.3)} strokeOpacity="0.35" />

      {/* corner guards */}
      {[
        'M20 66 V58 a18 18 0 0 1 18 -18 h8 v10 h-8 a8 8 0 0 0 -8 8 v8 z',
        'M220 66 V58 a18 18 0 0 0 -18 -18 h-8 v10 h8 a8 8 0 0 1 8 8 v8 z',
        'M20 280 V288 a18 18 0 0 0 18 18 h8 v-10 h-8 a8 8 0 0 1 -8 -8 v-8 z',
        'M220 280 V288 a18 18 0 0 1 -18 18 h-8 v-10 h8 a8 8 0 0 0 8 -8 v-8 z',
      ].map((p, i) => (
        <path key={i} d={p} fill={hw} stroke={hwLo} strokeOpacity="0.4" />
      ))}

      {/* latches + side handle */}
      {[96, 226].map((y) => (
        <g key={y}>
          <rect x="13" y={y} width="14" height="26" rx="4" fill={hw} stroke={hwLo} strokeOpacity="0.5" />
          <rect x="16" y={y + 4} width="8" height="7" rx="1.5" fill={hwLo} opacity="0.7" />
          <rect x="15" y={y + 2} width="3" height="22" rx="1.5" fill={hwHi} opacity="0.6" />
        </g>
      ))}
      <rect x="10" y="140" width="12" height="62" rx="6" fill={hw} stroke={hwLo} strokeOpacity="0.5" />
      <rect x="12" y="144" width="3" height="54" rx="1.5" fill={hwHi} opacity="0.7" />
    </svg>
  )
}
