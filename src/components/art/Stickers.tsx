import type { StickerKind } from '@/lib/types'
import { cn } from '@/lib/utils'

export const STICKER_LIST: { kind: StickerKind; name: string }[] = [
  { kind: 'tokyo', name: 'I LOVE TOKYO' },
  { kind: 'postit', name: '꼭 사기 메모' },
  { kind: 'tower', name: '도쿄 타워' },
  { kind: 'osaka', name: 'OSAKA' },
  { kind: 'fragile', name: 'FRAGILE' },
  { kind: 'fuji', name: '후지산' },
  { kind: 'cat', name: '마네키네코' },
  { kind: 'tag', name: '보딩 태그' },
  { kind: 'onigiri', name: '주먹밥' },
  { kind: 'sakura', name: '벚꽃' },
  { kind: 'ticket', name: '기차표' },
  { kind: 'packit', name: 'PACKIT 스탬프' },
]

const F = 'Pretendard Variable, -apple-system, sans-serif'
const CUT = { stroke: '#fff', strokeWidth: 7, strokeLinejoin: 'round' as const, paintOrder: 'stroke' as const }

/** Die-cut vinyl stickers: thick white border + soft shadow */
export function Sticker({ kind, className, color }: { kind: StickerKind; className?: string; color?: boolean }) {
  return (
    <svg viewBox="0 0 120 120" className={cn('overflow-visible drop-shadow-[0_4px_6px_rgba(0,0,0,0.16)]', !color && 'grayscale', className)} aria-hidden>
      {render(kind)}
    </svg>
  )
}

function render(kind: StickerKind) {
  switch (kind) {
    case 'tokyo':
      return (
        <g>
          <rect x="16" y="22" width="88" height="76" rx="6" fill="#fff" stroke="#fff" strokeWidth="8" />
          <rect x="16" y="22" width="88" height="76" rx="6" fill="#fff" stroke="#ececea" strokeWidth="1" />
          <text x="34" y="60" textAnchor="middle" fontSize="34" fontWeight="900" fill="#141413" fontFamily={F}>I</text>
          <path d="M76 66 C 58 54, 56 38, 68 36 C 73 35, 76 39, 76 42 C 76 39, 79 35, 84 36 C 96 38, 94 54, 76 66 Z" fill="#E2231A" transform="translate(-6 -6) scale(1.05)" />
          <text x="60" y="90" textAnchor="middle" fontSize="23" fontWeight="900" fill="#141413" fontFamily={F} letterSpacing="-0.5">TOKYO</text>
        </g>
      )
    case 'postit':
      return (
        <g transform="rotate(-7 60 60)">
          <path d="M18 18 H102 V86 L84 104 H18 Z" fill="#F7D94C" {...CUT} />
          <path d="M102 86 L84 86 L84 104 Z" fill="#E2C138" />
          <path d="M24 26 H96" stroke="#E9CB3E" strokeWidth="1" />
          <text x="58" y="58" textAnchor="middle" fontSize="18" fontWeight="700" fill="#2b2b2b" fontFamily="'Nanum Pen Script', 'Gaegu', cursive, sans-serif" transform="rotate(-4 58 58)">꼭 사기!</text>
          <text x="54" y="80" textAnchor="middle" fontSize="12" fontWeight="600" fill="#2b2b2b" fontFamily="cursive, sans-serif" transform="rotate(-4 54 80)">got it done ✓</text>
        </g>
      )
    case 'tower':
      return (
        <g>
          <path d="M60 6 L66 40 L76 80 L90 112 H30 L44 80 L54 40 Z" fill="#fff" stroke="#fff" strokeWidth="14" strokeLinejoin="round" />
          <path d="M60 8 L64 40 H56 Z" fill="#E8453C" />
          <path d="M56 40 H64 L72 76 H48 Z" fill="#fff" stroke="#E8453C" strokeWidth="2.5" />
          <path d="M50 58 H70 M52 50 L68 66 M68 50 L52 66" stroke="#E8453C" strokeWidth="1.6" />
          <rect x="44" y="74" width="32" height="7" rx="1" fill="#E8453C" />
          <path d="M46 81 L34 110 H44 L52 90 H68 L76 110 H86 L74 81 Z" fill="#E8453C" />
          <rect x="52" y="34" width="16" height="6" rx="1" fill="#E8453C" />
        </g>
      )
    case 'osaka':
      return (
        <g transform="rotate(-8 60 60)">
          <text x="60" y="74" textAnchor="middle" fontSize="38" fontWeight="900" fill="#fff" stroke="#fff" strokeWidth="18" strokeLinejoin="round" fontFamily={F} letterSpacing="-2">OSAKA</text>
          <text x="60" y="74" textAnchor="middle" fontSize="38" fontWeight="900" fill="#F27FB2" stroke="#7A4FD6" strokeWidth="5" strokeLinejoin="round" paintOrder="stroke" fontFamily={F} letterSpacing="-2">OSAKA</text>
          <text x="58" y="70" textAnchor="middle" fontSize="38" fontWeight="900" fill="#fff" opacity="0.25" fontFamily={F} letterSpacing="-2">OSAKA</text>
        </g>
      )
    case 'fragile':
      return (
        <g transform="rotate(-4 60 60)">
          <rect x="6" y="38" width="108" height="44" rx="22" fill="#2F9E5B" {...CUT} />
          <rect x="11" y="43" width="98" height="34" rx="17" fill="none" stroke="#fff" strokeWidth="2" />
          <text x="60" y="68" textAnchor="middle" fontSize="20" fontWeight="900" fill="#E8F6EE" fontFamily={F} letterSpacing="1">FRAGILE</text>
        </g>
      )
    case 'fuji':
      return (
        <g>
          <circle cx="60" cy="60" r="48" fill="#BFD7F7" {...CUT} />
          <circle cx="82" cy="38" r="9" fill="#E8453C" />
          <path d="M14 84 L48 44 L58 52 L66 44 L104 84 A48 48 0 0 1 14 84 Z" fill="#2F5DA8" />
          <path d="M48 44 L58 52 L66 44 L76 55 L66 61 L58 55 L50 61 L40 54 Z" fill="#fff" />
        </g>
      )
    case 'cat':
      return (
        <g>
          <path d="M30 42 L36 18 L50 34 H70 L84 18 L90 42 C 98 56, 98 96, 86 104 H34 C 22 96, 22 56, 30 42 Z" fill="#fff" stroke="#fff" strokeWidth="12" strokeLinejoin="round" />
          <path d="M30 42 L36 18 L50 34 H70 L84 18 L90 42 C 98 56, 98 96, 86 104 H34 C 22 96, 22 56, 30 42 Z" fill="#FBFAF7" stroke="#2b2b2b" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M38 24 L44 34 L36 36 Z M82 24 L76 34 L84 36 Z" fill="#F4A7C0" />
          <path d="M44 50 q4 -4 8 0 M68 50 q4 -4 8 0" stroke="#2b2b2b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M56 58 q4 4 8 0" stroke="#2b2b2b" strokeWidth="2" fill="none" strokeLinecap="round" />
          <rect x="34" y="66" width="52" height="7" rx="3.5" fill="#E8453C" />
          <circle cx="60" cy="78" r="6" fill="#F2C94C" stroke="#2b2b2b" strokeWidth="1.5" />
          <path d="M88 60 q10 -14 4 -28" stroke="#2b2b2b" strokeWidth="2.5" fill="#FBFAF7" strokeLinecap="round" />
          <circle cx="40" cy="92" r="5" fill="#F4A7C0" opacity="0.7" />
        </g>
      )
    case 'tag':
      return (
        <g transform="rotate(-6 60 60)">
          <rect x="10" y="30" width="100" height="60" rx="8" fill="#fff" {...CUT} />
          <rect x="10" y="30" width="100" height="16" rx="8" fill="#3E6FD8" />
          <rect x="10" y="38" width="100" height="8" fill="#3E6FD8" />
          <text x="18" y="42" fontSize="8" fontWeight="800" fill="#fff" fontFamily={F}>BOARDING PASS</text>
          <text x="18" y="70" fontSize="20" fontWeight="900" fill="#141413" fontFamily={F}>ICN</text>
          <text x="58" y="68" fontSize="12" fill="#3E6FD8" fontFamily={F}>✈</text>
          <text x="72" y="70" fontSize="20" fontWeight="900" fill="#141413" fontFamily={F}>HND</text>
          {Array.from({ length: 22 }).map((_, i) => (
            <rect key={i} x={18 + i * 4} y="76" width={i % 3 ? 1.5 : 2.5} height="8" fill="#141413" />
          ))}
        </g>
      )
    case 'onigiri':
      return (
        <g>
          <path d="M60 14 C70 14 108 78 104 90 C100 102 20 102 16 90 C12 78 50 14 60 14 Z" fill="#FBFAF6" {...CUT} />
          <rect x="40" y="66" width="40" height="30" rx="3" fill="#24302A" />
          <circle cx="50" cy="54" r="3" fill="#24302A" />
          <circle cx="70" cy="54" r="3" fill="#24302A" />
          <path d="M55 60 Q60 64 65 60" stroke="#24302A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="43" cy="60" r="4" fill="#F7B8CC" />
          <circle cx="77" cy="60" r="4" fill="#F7B8CC" />
        </g>
      )
    case 'sakura':
      return (
        <g>
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse key={`o${r}`} cx="60" cy="34" rx="18" ry="25" fill="#fff" stroke="#fff" strokeWidth="9" transform={`rotate(${r} 60 60)`} />
          ))}
          {[0, 72, 144, 216, 288].map((r) => (
            <path key={r} d="M60 60 C 42 46, 44 18, 56 12 L60 18 L64 12 C 76 18, 78 46, 60 60 Z" fill="#F7B8CC" transform={`rotate(${r} 60 60)`} />
          ))}
          <circle cx="60" cy="60" r="7" fill="#F2C94C" />
        </g>
      )
    case 'ticket':
      return (
        <g transform="rotate(5 60 60)">
          <path d="M8 36 H112 V52 a8 8 0 0 0 0 16 V84 H8 V68 a8 8 0 0 0 0 -16 Z" fill="#F3EEE2" {...CUT} />
          <rect x="8" y="36" width="104" height="10" fill="#2F9E5B" />
          <line x1="84" y1="48" x2="84" y2="82" stroke="#c9c2b0" strokeDasharray="3 3" strokeWidth="1.5" />
          <text x="46" y="64" textAnchor="middle" fontSize="11" fontWeight="900" fill="#141413" fontFamily={F}>SHIBUYA</text>
          <text x="46" y="77" textAnchor="middle" fontSize="9" fontWeight="600" fill="#6b6b66" fontFamily={F}>→ HARAJUKU</text>
          <text x="98" y="69" textAnchor="middle" fontSize="10" fontWeight="900" fill="#141413" fontFamily={F}>¥160</text>
        </g>
      )
    case 'packit':
      return <PackitMark />
  }
}

/** Packit stamp logo mark */
export function PackitMark() {
  return (
    <g>
      <circle cx="60" cy="60" r="52" fill="#fff" />
      <circle cx="60" cy="60" r="46" fill="#111111" />
      <path d="M18 46 Q60 30 102 46" stroke="#fff" strokeWidth="2.5" fill="none" opacity="0.7" />
      <path d="M16 74 Q60 90 104 74" stroke="#fff" strokeWidth="2.5" fill="none" opacity="0.7" />
      <path d="M60 14 Q40 60 60 106" stroke="#fff" strokeWidth="2.5" fill="none" opacity="0.55" />
      <path d="M60 14 Q80 60 60 106" stroke="#fff" strokeWidth="2.5" fill="none" opacity="0.55" />
      <g transform="rotate(-10 60 60)">
        <rect x="8" y="46" width="104" height="28" rx="6" fill="#fff" stroke="#141413" strokeWidth="2.5" />
        <text x="60" y="67" textAnchor="middle" fontSize="21" fontWeight="900" fill="#111111" fontFamily={F} letterSpacing="1">PACKIT</text>
      </g>
    </g>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-label="Packit">
      <PackitMark />
    </svg>
  )
}
