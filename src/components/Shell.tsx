import { toast } from 'sonner'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'
import { Check, Compass, ChevronsUpDown, House, Luggage, Map, MapPin, Plus, Smartphone } from 'lucide-react'
import { useEffect } from 'react'
import { useApp, type Tab } from '@/lib/store'
import { cn, dday, shortRange } from '@/lib/utils'
import { Logo } from './art/Stickers'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export const NAV: { id: Tab; label: string; icon: typeof House }[] = [
  { id: 'home', label: '홈', icon: House },
  { id: 'magazine', label: '발견', icon: Compass },
  { id: 'map', label: '지도', icon: Map },
  { id: 'carry', label: '캐리어', icon: Luggage },
]

export function BottomNav() {
  const { tab, setTab, open } = useApp()
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex items-end justify-between gap-2.5 px-4 pb-[max(14px,env(safe-area-inset-bottom))] lg:hidden">
      <nav className="pointer-events-auto flex h-16 flex-1 items-center justify-around rounded-2xl border bg-background/95 px-1.5 shadow-lg backdrop-blur" aria-label="주요 메뉴">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = tab === id
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex h-12 min-w-14 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[11px] font-medium transition-colors',
                active ? 'bg-accent text-foreground' : 'text-muted-foreground',
              )}
            >
              <Icon className="relative size-5" strokeWidth={active ? 2.3 : 1.9} />
              <span className="relative">{label}</span>
            </button>
          )
        })}
      </nav>
      <button
        onClick={() => open({ type: 'save' })}
        aria-label="상품 저장하기"
        className="pointer-events-auto grid size-16 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg transition active:scale-95"
      >
        <Plus className="size-6" strokeWidth={2.4} />
      </button>
    </div>
  )
}

export function Sidebar() {
  const { tab, setTab, open, trip, points } = useApp()
  return (
    <aside className="sticky top-0 hidden h-dvh w-[260px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-3 text-sidebar-foreground lg:flex">
      <div className="flex h-12 items-center gap-2.5 px-2">
        <Logo className="size-8" />
        <span className="display text-[20px]">Packit</span>
      </div>
      <div className="mt-2">
        <TripSwitcher variant="sidebar" />
      </div>
      <p className="mt-5 px-2 pb-1.5 text-[12px] font-medium text-sidebar-foreground/60">메뉴</p>
      <nav className="flex flex-col gap-1" aria-label="주요 메뉴">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = tab === id
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex h-9 items-center gap-2.5 rounded-md px-2.5 text-[14px] transition-colors',
                active ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className="size-4" strokeWidth={2} />
              {label}
            </button>
          )
        })}
      </nav>
      <Button className="mt-4 w-full" onClick={() => open({ type: 'save' })}>
        <Plus /> 상품 저장하기
      </Button>
      <div className="mt-auto flex flex-col gap-2">
        <div className="rounded-lg border bg-background p-3.5 shadow-xs">
          <p className="text-[12px] font-medium text-muted-foreground">{trip.city} 여행까지</p>
          <p className="display mt-1 text-[26px]">{dday(trip.start)}</p>
          <p className="mt-0.5 text-[12px] text-muted-foreground tabular">{shortRange(trip.start, trip.end)}</p>
        </div>
        <a href="#mobile" className="flex h-9 items-center justify-center gap-2 rounded-md border bg-background text-[13px] font-medium shadow-xs hover:bg-accent">
          <Smartphone className="size-4" /> 휴대폰 화면으로 보기
        </a>
        <Separator className="my-1" />
        <button onClick={() => open({ type: 'benefits' })} className="flex h-12 items-center gap-2.5 rounded-md px-2 text-left hover:bg-sidebar-accent">
          <Avatar className="size-8 rounded-lg">
            <AvatarFallback className="rounded-lg text-[11px] font-semibold">수빈</AvatarFallback>
          </Avatar>
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="text-[13.5px] font-medium">수빈</span>
            <span className="text-[12px] text-muted-foreground">내 발견 · 혜택</span>
          </span>
          <Badge variant="secondary" className="tabular">{points.toLocaleString('ko-KR')}P</Badge>
        </button>
      </div>
    </aside>
  )
}

export function TripSwitcher({ variant = 'pill' }: { variant?: 'pill' | 'sidebar' }) {
  const { trips, trip, setTripId, open } = useApp()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-2 font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50',
            variant === 'pill'
              ? 'h-8 rounded-md border bg-background pr-2.5 pl-2 text-[13px] shadow-xs hover:bg-accent'
              : 'h-12 w-full rounded-md px-2 text-left hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent',
          )}
        >
          {variant === 'pill' ? (
            <>
              <MapPin className="size-3.5" />
              <span className="tabular">
                {trip.city} {shortRange(trip.start, trip.end)}
              </span>
            </>
          ) : (
            <>
              <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                <MapPin className="size-4" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="truncate text-[14px] font-medium">{trip.name}</span>
                <span className="text-[12px] font-normal text-muted-foreground tabular">
                  {trip.city} · {shortRange(trip.start, trip.end)}
                </span>
              </span>
            </>
          )}
          <ChevronsUpDown className="size-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[260px]">
        <DropdownMenuLabel className="text-[12px] font-medium text-muted-foreground">내 여행</DropdownMenuLabel>
        {trips.map((t) => (
          <DropdownMenuItem key={t.id} onSelect={() => setTripId(t.id)} className="gap-2.5 py-2">
            <span className="size-3 shrink-0 rounded-full border" style={{ background: t.suitcase.color }} />
            <span className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="truncate text-[13.5px] font-medium">{t.name}</span>
              <span className="text-[12px] text-muted-foreground tabular">
                {t.city} · {shortRange(t.start, t.end)}
              </span>
            </span>
            {t.id === trip.id && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => open({ type: 'create' })} className="gap-2.5 py-2 text-[13.5px]">
          <span className="grid size-6 place-items-center rounded-md border">
            <Plus className="size-3.5" />
          </span>
          새 여행 만들기
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Toaster() {
  const { toast: t } = useApp()
  useEffect(() => {
    if (t) toast(t.text)
  }, [t])
  return <SonnerToaster position="bottom-center" offset={{ bottom: 32 }} mobileOffset={{ bottom: 112 }} toastOptions={{ className: 'justify-center font-medium' }} />
}
