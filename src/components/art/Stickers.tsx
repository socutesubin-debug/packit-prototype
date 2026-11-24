import type { StickerKind } from '@/lib/types'
import { cn } from '@/lib/utils'

export const STICKER_LIST: { kind: StickerKind; name: string }[] = [
  { kind: 'tokyo', name: 'TOKYO' },
  { kind: 'packit', name: 'PACKIT 스탬프' },
  { kind: 'fuji', name: '후지산' },
  { kind: 'sakura', name: '벚꽃' },
  { kind: 'tag', name: '수하물 태그' },
  { kind: 'ticket', name: '기차표' },
  { kind: 'onigiri', name: '주먹밥' },
  { kind: 'osaka', name: 'OSAKA' },
]

const W = { strokeLinejoin: 'round' as const }

/** Die-cut sticker illustrations (white border + soft shadow) */
export function Sticker({ kind, className }: { kind: StickerKind; className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={cn('drop-shadow-[0_3px_4px_rgba(20,20,19,0.22)]', className)} aria-hidden>
      {render(kind)}
    </svg>
  )
}

function render(kind: StickerKind) {
  switch (kind) {
    case 'tokyo':
      return (
        <g {...W}>
          <rect x="8" y="32" width="104" height="56" rx="16" fill="#E8453C" stroke="#fff" strokeWidth="6" />
          <text x="60" y="66" textAnchor="middle" fontSize="24" fontWeight="900" fill="#fff" fontFamily="Pretendard Variable, sans-serif" letterSpacing="-0.5">TOKYO</text>
          <text x="60" y="80" textAnchor="middle" fontSize="9" fontWeight="700" fill="#FFD7D2" fontFamily="sans-serif">東京 · JAPAN</text>
        </g>
      )
    case 'packit':
      return <PackitMark />
    case 'fuji':
      return (
        <g {...W}>
          <circle cx="60" cy="60" r="50" fill="#86A8F0" stroke="#fff" strokeWidth="6" />
          <circle cx="82" cy="40" r="9" fill="#E8453C" />
          <path d="M18 88 L50 46 L60 54 L70 46 L102 88 Z" fill="#2F5DA8" />
          <path d="M50 46 L60 54 L70 46 L78 57 L68 62 L60 56 L52 62 L42 57 Z" fill="#fff" />
        </g>
      )
    case 'sakura':
      return (
        <g {...W}>
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse key={r} cx="60" cy="34" rx="17" ry="24" fill="#F7B8CC" stroke="#fff" strokeWidth="5" transform={`rotate(${r} 60 60)`} />
          ))}
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse key={`f${r}`} cx="60" cy="34" rx="14" ry="21" fill="#F7B8CC" transform={`rotate(${r} 60 60)`} />
          ))}
          <circle cx="60" cy="60" r="10" fill="#F2C94C" />
        </g>
      )
    case 'tag':
      return (
        <g {...W} transform="rotate(-8 60 60)">
          <path d="M24 30 H96 a8 8 0 0 1 8 8 V82 a8 8 0 0 1 -8 8 H24 L10 60 Z" fill="#FFF7E8" stroke="#fff" strokeWidth="6" />
          <path d="M24 30 H96 a8 8 0 0 1 8 8 V82 a8 8 0 0 1 -8 8 H24 L10 60 Z" fill="none" stroke="#E6DCC8" strokeWidth="1.5" />
          <circle cx="26" cy="60" r="5" fill="#fff" stroke="#E6DCC8" />
          <text x="66" y="58" textAnchor="middle" fontSize="20" fontWeight="900" fill="#E8453C" fontFamily="sans-serif">ICN</text>
          <text x="66" y="76" textAnchor="middle" fontSize="11" fontWeight="800" fill="#2F5DA8" fontFamily="sans-serif">→ HND ✈</text>
        </g>
      )
    case 'ticket':
      return (
        <g {...W} transform="rotate(6 60 60)">
          <path d="M10 38 H110 V52 a8 8 0 0 0 0 16 V82 H10 V68 a8 8 0 0 0 0 -16 Z" fill="#9AC7B5" stroke="#fff" strokeWidth="6" />
          <line x1="80" y1="40" x2="80" y2="80" stroke="#fff" strokeDasharray="3 3" strokeWidth="2" />
          <text x="44" y="58" textAnchor="middle" fontSize="11" fontWeight="900" fill="#173D30" fontFamily="sans-serif">SHIBUYA</text>
          <text x="44" y="72" textAnchor="middle" fontSize="9" fontWeight="700" fill="#173D30" fontFamily="sans-serif">→ HARAJUKU</text>
          <text x="96" y="64" textAnchor="middle" fontSize="10" fontWeight="900" fill="#fff" fontFamily="sans-serif">¥160</text>
        </g>
      )
    case 'onigiri':
      return (
        <g {...W}>
          <path d="M60 14 C70 14 108 78 104 90 C100 102 20 102 16 90 C12 78 50 14 60 14 Z" fill="#fff" stroke="#fff" strokeWidth="8" />
          <path d="M60 18 C68 18 102 78 99 88 C96 98 24 98 21 88 C18 78 52 18 60 18 Z" fill="#FBFAF6" stroke="#E6E4DF" strokeWidth="1.5" />
          <rect x="40" y="64" width="40" height="32" rx="4" fill="#24302A" />
          <circle cx="50" cy="52" r="3" fill="#24302A" />
          <circle cx="70" cy="52" r="3" fill="#24302A" />
          <path d="M55 58 Q60 62 65 58" stroke="#24302A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="44" cy="58" r="4" fill="#F7B8CC" />
          <circle cx="76" cy="58" r="4" fill="#F7B8CC" />
        </g>
      )
    case 'osaka':
      return (
        <g {...W}>
          <path d="M60 8 L72 20 L90 18 L92 36 L108 46 L100 62 L108 78 L92 86 L90 104 L72 102 L60 114 L48 102 L30 104 L28 86 L12 78 L20 62 L12 46 L28 36 L30 18 L48 20 Z" fill="#F2C94C" stroke="#fff" strokeWidth="6" />
          <text x="60" y="64" textAnchor="middle" fontSize="20" fontWeight="900" fill="#1E1E1E" fontFamily="sans-serif">OSAKA</text>
          <text x="60" y="80" textAnchor="middle" fontSize="11" fontWeight="800" fill="#E8453C" fontFamily="sans-serif">大阪</text>
        </g>
      )
  }
}

/** Packit stamp logo mark */
export function PackitMark() {
  return (
    <g>
      <circle cx="60" cy="60" r="52" fill="#fff" />
      <circle cx="60" cy="60" r="46" fill="#E8453C" />
      <path d="M18 46 Q60 30 102 46" stroke="#fff" strokeWidth="2.5" fill="none" opacity="0.7" />
      <path d="M16 74 Q60 90 104 74" stroke="#fff" strokeWidth="2.5" fill="none" opacity="0.7" />
      <path d="M60 14 Q40 60 60 106" stroke="#fff" strokeWidth="2.5" fill="none" opacity="0.55" />
      <path d="M60 14 Q80 60 60 106" stroke="#fff" strokeWidth="2.5" fill="none" opacity="0.55" />
      <g transform="rotate(-10 60 60)">
        <rect x="8" y="46" width="104" height="28" rx="6" fill="#fff" stroke="#141413" strokeWidth="2.5" />
        <text x="60" y="67" textAnchor="middle" fontSize="21" fontWeight="900" fill="#E8453C" fontFamily="Pretendard Variable, sans-serif" letterSpacing="1">PACKIT</text>
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
