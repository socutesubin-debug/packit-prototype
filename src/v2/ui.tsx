import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, Compass, House, Luggage, Map as MapIcon, Plus, Search, StickyNote, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { ProductArt } from '@/components/art/ProductArt'
import { useApp, type Tab } from '@/lib/store'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/utils'

/*
 * Packit 디자인 시스템 v2 — 피그마 '시안2' 기준. 모든 치수 짝수.
 */
export const C = {
  bg: '#FAFAFA',
  ink: '#111111',
  btn: '#24222D',
  sub: '#666661',
  ter: '#92928C',
  gray: '#8E8E93',
  g3: '#C7C7CC',
  g4: '#D1D1D6',
  g5: '#E5E5EA',
  line: '#EDEDED',
  soft: '#EBEBEB',
  fab: '#8E8AF6',
  pink: '#F2B5CA',
  flag: '#91B8F0',
  me: '#4F88ED',
  open: '#34C759',
  best: '#34C759',
  good: '#00C0E8',
  bad: '#FF8D28',
}

export const yenStr = (n: number) => `¥${n.toLocaleString('ko-KR')}`
export const wonStr = (n: number, rate: number) => `약 ${Math.round((n * rate) / 100).toLocaleString('ko-KR')}원`

/** ¥980 약 8,330원 */
export function Price({ yen, size = 'm', className }: { yen: number; size?: 's' | 'm' | 'l'; className?: string }) {
  const { rate } = useApp()
  const big = size === 'l' ? 't-price-l' : size === 's' ? 't-label font-semibold' : 't-body-m font-semibold'
  return (
    <span className={cn('inline-flex items-baseline gap-1 whitespace-nowrap', className)}>
      <span className={big}>{yenStr(yen)}</span>
      <span className={size === 'l' ? 't-label' : 't-cap'} style={{ color: C.ter }}>
        {wonStr(yen, rate)}
      </span>
    </span>
  )
}

/** 상품 사진 (없으면 일러스트) — 사진은 배경 없는 PNG */
export function ProductImg({ p, className, tone }: { p: Product; className?: string; tone?: 'shadow' }) {
  if (p.photo) return <img src={p.photo} alt="" draggable={false} className={cn('object-contain select-none', tone === 'shadow' && 'drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)]', className)} />
  return <ProductArt art={p.art} tone="neutral" className={cn('rounded-lg', className)} />
}

export function PillButton({ className, disabled, dark = true, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { dark?: boolean }) {
  return (
    <button
      {...p}
      disabled={disabled}
      className={cn('t-body-l flex h-12 w-full items-center justify-center gap-2 rounded-full px-2 text-white transition active:scale-[0.99]', className)}
      style={{ background: disabled ? C.g3 : dark ? C.btn : C.gray, ...p.style }}
    />
  )
}

export function IconBtn({ label, onClick, children, className, style }: { label: string; onClick?: () => void; children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <button aria-label={label} title={label} onClick={onClick} className={cn('grid size-11 shrink-0 place-items-center rounded-full transition active:scale-95', className)} style={style}>
      {children}
    </button>
  )
}

export function BackButton({ onClick, circle, label = '뒤로' }: { onClick: () => void; circle?: boolean; label?: string }) {
  return (
    <IconBtn label={label} onClick={onClick} className={circle ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]' : '-ml-2'}>
      <ChevronLeft className="size-7" strokeWidth={1.6} />
    </IconBtn>
  )
}

/** 프로필 동그라미 (이니셜) */
export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-full font-medium" style={{ width: size, height: size, background: C.line, color: C.ter, fontSize: size * 0.4 }}>
      {name.slice(0, 1)}
    </span>
  )
}

/** 상단 오른쪽: 프로필 + 포인트 */
export function PointBadge() {
  const { points, open } = useApp()
  return (
    <button onClick={() => open({ type: 'benefits' })} className="flex items-center gap-2" aria-label={`포인트 ${points}P`}>
      <span className="size-[26px] rounded-full" style={{ background: C.g5 }} />
      <span className="t-cap2 font-semibold tabular">{points.toLocaleString()}P</span>
    </button>
  )
}

/** 화면 껍데기: 배경 #FAFAFA · 아래 네비 자리만큼 여백 */
export function Screen({ children, nav = true, className }: { children: ReactNode; nav?: boolean; className?: string }) {
  return (
    <div className={cn('pk relative mx-auto min-h-dvh w-full max-w-[480px] pt-[env(safe-area-inset-top)]', className)} style={{ background: C.bg, paddingBottom: nav ? 'calc(120px + env(safe-area-inset-bottom))' : undefined }}>
      {children}
    </div>
  )
}

const NAV: { tab: Tab; label: string; Icon: typeof House }[] = [
  { tab: 'home', label: '홈', Icon: House },
  { tab: 'magazine', label: '발견', Icon: Compass },
  { tab: 'map', label: '지도', Icon: MapIcon },
  { tab: 'carry', label: '캐리어', Icon: Luggage },
]

/** 하단 네비: 흰 알약(아이콘 4개) + 오른쪽 FAB — 탭마다 FAB 기능이 달라요 */
export function BottomNav2() {
  const { tab, setTab, open, overlays, trip } = useApp()
  if (overlays.some((o) => o.type !== 'benefits')) return null
  const fab =
    tab === 'magazine'
      ? { label: '발견 올리기', icon: <Plus className="size-7" strokeWidth={1.8} />, act: () => open({ type: 'post' }) }
      : tab === 'carry'
        ? { label: '캐리어 꾸미기', icon: <StickyNote className="size-6" strokeWidth={1.8} />, act: () => open({ type: 'carry', tripId: trip.id }) }
        : { label: '상품 담기', icon: <Plus className="size-7" strokeWidth={1.8} />, act: () => open({ type: 'save' }) }
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40">
      <div className="pk mx-auto flex w-full max-w-[480px] items-end justify-between px-5 pb-[max(34px,env(safe-area-inset-bottom))]">
        <nav aria-label="메인 메뉴" className="pointer-events-auto flex h-[60px] items-center gap-0 rounded-full bg-white px-1 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
          {NAV.map(({ tab: t, label, Icon }) => {
            const on = tab === t
            return (
              <button key={t} aria-label={label} aria-current={on ? 'page' : undefined} onClick={() => setTab(t)} className="grid h-[52px] w-16 place-items-center rounded-full transition" style={{ background: on ? C.line : 'transparent' }}>
                <Icon className="size-6" strokeWidth={1.6} />
              </button>
            )
          })}
        </nav>
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          {tab === 'magazine' && (
            <button onClick={fab.act} className="t-body-m h-11 rounded-full px-5 whitespace-nowrap text-white shadow-[0_4px_12px_rgba(0,0,0,0.16)]" style={{ background: C.ink }}>
              발견 올리기
            </button>
          )}
          <button aria-label={fab.label} onClick={fab.act} className="grid size-[52px] place-items-center rounded-full text-white shadow-[0_4px_12px_rgba(142,138,246,0.4)] transition active:scale-95" style={{ background: C.fab }}>
            {fab.icon}
          </button>
        </div>
      </div>
    </div>
  )
}

/** 아래에서 올라오는 시트 (흰 · 위 모서리 24) */
export function Sheet2({ open, onClose, title, children, z = 70 }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; z?: number }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="pk fixed inset-0" style={{ zIndex: z }}>
          <motion.button aria-label="닫기" className="absolute inset-0 bg-black/20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            role="dialog"
            aria-label={title}
            className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[480px] rounded-t-3xl bg-white px-6 pt-6 pb-[max(34px,env(safe-area-inset-bottom))]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            {title && (
              <div className="mb-5 flex items-center justify-between">
                <h2 className="t-h3">{title}</h2>
                <IconBtn label="닫기" onClick={onClose} className="-mr-3">
                  <X className="size-6" strokeWidth={1.6} style={{ color: C.sub }} />
                </IconBtn>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/** 흰 동그라미 검색 버튼 (40) */
export function SearchCircle({ onClick }: { onClick?: () => void }) {
  return (
    <button aria-label="검색" onClick={onClick} className="grid size-10 shrink-0 place-items-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <Search className="size-5" strokeWidth={1.8} />
    </button>
  )
}

/** 흰 알약 칩 (h36) */
export function Chip2({ active, onClick, children, dark, className }: { active?: boolean; onClick?: () => void; children: ReactNode; dark?: boolean; className?: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn('t-label flex h-9 shrink-0 items-center gap-1 rounded-full px-3 whitespace-nowrap transition', className)}
      style={active ? { background: dark ? C.gray : C.btn, color: '#fff' } : { background: '#fff', color: C.sub }}
    >
      {children}
    </button>
  )
}

/** 섹션 제목 + 1.5px 검정 선 */
export function SectionHead({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex h-6 items-end border-b-2 pb-1', className)} style={{ borderColor: C.ink }}>
      <h2 className="t-label font-semibold">{children}</h2>
    </div>
  )
}
