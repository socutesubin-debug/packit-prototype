import { AnimatePresence, motion } from 'motion/react'
import { Camera, Check, ChevronLeft, Image as ImageIcon, Link2, PenLine, Sparkles, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ProductArt } from '@/components/art/ProductArt'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Chip, Sheet } from '@/components/ui/primitives'
import { CATEGORIES } from '@/lib/data'
import { useApp } from '@/lib/store'
import { FlagMark } from './Finds'
import type { Category, Product } from '@/lib/types'
import { cn, toWon, won, yen } from '@/lib/utils'

type Mode = 'menu' | 'link' | 'manual'

export function SaveSheet() {
  const { close, open, addManual, notify, trip } = useApp()
  const [mode, setMode] = useState<Mode>('menu')
  const [link, setLink] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [cat, setCat] = useState<Category>('뷰티')
  const shots = useRef<HTMLInputElement>(null)
  const camera = useRef<HTMLInputElement>(null)

  const onFiles = (files: FileList | null) => {
    if (!files?.length) return
    const images = Array.from(files)
      .slice(0, 6)
      .map((f) => URL.createObjectURL(f))
    close()
    open({ type: 'analyze', mode: 'shots', images })
  }

  const options = [
    { id: 'shot', label: '스크린샷', sub: '여러 장 한 번에', icon: ImageIcon, run: () => shots.current?.click() },
    { id: 'link', label: '링크 붙여넣기', sub: '인스타 · 유튜브 · 쇼핑몰', icon: Link2, run: () => setMode('link') },
    { id: 'cam', label: '사진 촬영', sub: '매장에서 바로', icon: Camera, run: () => camera.current?.click() },
    { id: 'manual', label: '직접 입력', sub: '이름과 가격만', icon: PenLine, run: () => setMode('manual') },
  ]

  return (
    <Sheet open onClose={close} title={mode === 'menu' ? '어떻게 저장할까요?' : mode === 'link' ? '링크로 저장' : '직접 입력'}>
      <input ref={shots} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
      <input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={(e) => onFiles(e.target.files)} />
      {mode === 'menu' && (
        <>
          <p className="-mt-2 mb-4 text-[13.5px] text-muted-foreground">
            <b className="font-semibold text-ink-2">{trip.name}</b>에 담겨요
          </p>
          <button
            onClick={() => {
              close()
              open({ type: 'post' })
            }}
            className="mb-2.5 flex w-full items-center gap-3 rounded-xl bg-ink p-4 text-left text-white transition active:scale-[0.99]"
          >
            <span className="grid size-10 place-items-center rounded-2xl bg-white/10">
              <FlagMark light className="h-[22px] w-[17px]" />
            </span>
            <span className="flex-1">
              <span className="block text-[15px] font-semibold">현지 발견 올리기</span>
              <span className="mt-0.5 block text-[12px] text-white/60">지도에 없는 물건을 알려 주고 포인트 받기</span>
            </span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[12px] font-semibold">+50P</span>
          </button>
          <div className="grid grid-cols-2 gap-2.5">
            {options.map(({ id, label, sub, icon: Icon, run }) => (
              <button key={id} onClick={run} className="flex flex-col items-start gap-3 rounded-xl border bg-card p-4 text-left shadow-xs transition hover:bg-accent active:scale-[0.98]">
                <span className="grid size-9 place-items-center rounded-lg border bg-background">
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="block text-[15px] font-semibold">{label}</span>
                  <span className="mt-0.5 block text-[12px] text-muted-foreground">{sub}</span>
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              close()
              open({ type: 'analyze', mode: 'shots', images: [] })
            }}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-[14px] font-semibold text-ink-2 hover:bg-accent"
          >
            <Sparkles className="size-4" /> 예시 스크린샷으로 AI 정리 체험하기
          </button>
        </>
      )}
      {mode === 'link' && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            close()
            open({ type: 'analyze', mode: 'link', images: [] })
          }}
        >
          <Input autoFocus value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://www.instagram.com/p/…" className="h-11 bg-background text-[15px]" />
          <p className="mt-2 text-[12.5px] text-muted-foreground">게시물 속 상품을 찾아 리스트에 담아요</p>
          <div className="mt-5 flex gap-2">
            <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => setMode('menu')}>
              뒤로
            </Button>
            <Button size="lg" className="flex-[2]" disabled={!link.trim()}>
              상품 찾기
            </Button>
          </div>
        </form>
      )}
      {mode === 'manual' && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            addManual(name.trim(), Number(price) || 0, cat)
            close()
            notify('리스트에 담았어요')
          }}
          className="flex flex-col gap-3"
        >
          <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="상품 이름" className="h-11 bg-background text-[15px]" />
          <label className="flex h-11 items-center rounded-md border border-input bg-background px-3 shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
            <span className="mr-1 font-semibold text-muted-foreground">¥</span>
            <input inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} placeholder="현지 가격 (선택)" className="flex-1 bg-transparent tabular outline-none placeholder:text-faint" />
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
                {c}
              </Chip>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => setMode('menu')}>
              뒤로
            </Button>
            <Button size="lg" className="flex-[2]" disabled={!name.trim()}>
              저장하기
            </Button>
          </div>
        </form>
      )}
    </Sheet>
  )
}

export function Analyze({ mode, images }: { mode: 'shots' | 'link' | 'manual'; images: string[] }) {
  const { close, scan, addProducts, notify, rate, setTab } = useApp()
  const count = mode === 'link' ? 1 : images.length || 3
  const results = useMemo(() => scan(count), []) // eslint-disable-line react-hooks/exhaustive-deps
  const [done, setDone] = useState(0)
  const [picked, setPicked] = useState<Set<string>>(() => new Set(results.map((r) => r.id)))

  useEffect(() => {
    if (done >= results.length) return
    const t = window.setTimeout(() => setDone((d) => d + 1), done === 0 ? 1300 : 900)
    return () => window.clearTimeout(t)
  }, [done, results.length])

  useEffect(() => () => images.forEach((u) => URL.revokeObjectURL(u)), [images])

  const finished = done >= results.length
  const chosen = results.filter((r) => picked.has(r.id))

  return (
    <motion.div className="fixed inset-0 z-[58] overflow-y-auto bg-ground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="mx-auto flex min-h-dvh max-w-[620px] flex-col px-5 pt-[max(16px,env(safe-area-inset-top))] pb-8 lg:pt-10">
        <header className="flex h-12 items-center">
          <button aria-label="닫기" onClick={close} className="-ml-2 grid size-11 place-items-center rounded-full hover:bg-accent">
            <X className="size-6" />
          </button>
        </header>
        <div className="mt-2">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-[12.5px] font-semibold text-ink border">
            <Sparkles className="size-3.5" /> AI 상품 정리
          </p>
          <h1 className="display mt-3 text-[28px]">
            {finished ? `${results.length}개 상품을 찾았어요` : mode === 'link' ? '게시물에서 상품을 찾는 중' : '스크린샷을 읽는 중이에요'}
          </h1>
          <p className="mt-1.5 text-[14px] text-muted-foreground">{finished ? '담을 상품만 골라 주세요. 틀린 정보는 상세에서 고칠 수 있어요.' : `${Math.min(done + 1, results.length)} / ${results.length}`}</p>
        </div>

        {mode !== 'link' && (
          <div className="no-scrollbar -mx-5 mt-6 flex gap-3 overflow-x-auto px-5 pb-2">
            {results.map((r, i) => (
              <Shot key={r.id} src={images[i]} product={r} state={i < done ? 'done' : i === done ? 'scan' : 'wait'} />
            ))}
          </div>
        )}

        <ul className="mt-6 flex flex-col gap-2.5">
          <AnimatePresence>
            {results.slice(0, done).map((r) => {
              const on = picked.has(r.id)
              return (
                <motion.li key={r.id} initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
                  <button
                    onClick={() =>
                      setPicked((s) => {
                        const n = new Set(s)
                        if (n.has(r.id)) n.delete(r.id)
                        else n.add(r.id)
                        return n
                      })
                    }
                    className={cn('flex w-full items-center gap-3.5 rounded-xl border bg-card shadow-xs p-2.5 pr-4 text-left transition', on ? 'ring-2 ring-ink' : 'opacity-60 border')}
                  >
                    <ProductArt art={r.art} className="size-16 shrink-0 rounded-2xl" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-semibold tracking-wide text-muted-foreground">
                        {r.brand} · {r.category}
                      </span>
                      <span className="mt-0.5 line-clamp-1 block text-[14.5px] font-semibold">{r.name}</span>
                      <span className="mt-0.5 block text-[13px] tabular">
                        <b className="font-extrabold">{yen(r.price)}</b> <span className="text-muted-foreground">약 {won(toWon(r.price, rate))}</span>
                      </span>
                    </span>
                    <span className={cn('grid size-6 shrink-0 place-items-center rounded-full', on ? 'bg-ink text-white' : 'ring-2 ring-line')}>{on && <Check className="size-4" strokeWidth={3} />}</span>
                  </button>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>

        <div className="sticky bottom-0 mt-auto bg-gradient-to-t from-ground from-70% to-transparent pt-6">
          <Button
            size="lg"
            className="w-full"
            disabled={!finished || chosen.length === 0}
            onClick={() => {
              addProducts(chosen)
              setTab('home')
              close()
              notify(`${chosen.length}개 담았어요 · 홈에서 바로 골라 보세요`)
              window.scrollTo({ top: 0 })
            }}
          >
            {finished ? `${chosen.length}개 리스트에 담기` : '정리하는 중…'}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function Shot({ src, product, state }: { src?: string; product: Product; state: 'wait' | 'scan' | 'done' }) {
  return (
    <div className={cn('relative h-[200px] w-[112px] shrink-0 overflow-hidden rounded-xl bg-ink ring-4 transition', state === 'done' ? 'ring-brand/0' : state === 'scan' ? 'ring-brand/30' : 'ring-transparent opacity-50')}>
      {src ? (
        <img src={src} alt="업로드한 스크린샷" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full flex-col bg-[#fafafa] p-2">
          <div className="flex items-center gap-1.5">
            <span className="size-4 rounded-full bg-line" />
            <span className="h-1.5 w-10 rounded bg-line" />
          </div>
          <ProductArt art={product.art} className="mt-2 aspect-square w-full rounded-lg" />
          <span className="mt-2 h-1.5 w-full rounded bg-line" />
          <span className="mt-1 h-1.5 w-2/3 rounded bg-line" />
          <span className="mt-1 h-1.5 w-1/2 rounded bg-line" />
        </div>
      )}
      {state === 'scan' && (
        <div className="pointer-events-none absolute inset-0">
          <div className="scan-line absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-brand/45 to-transparent" />
        </div>
      )}
      {state === 'done' && (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-ink text-white shadow">
          <Check className="size-3.5" strokeWidth={3.2} />
        </motion.span>
      )}
    </div>
  )
}

export function BackHeader({ onBack, children, className }: { onBack: () => void; children?: React.ReactNode; className?: string }) {
  return (
    <header className={cn('flex h-14 items-center justify-between px-3', className)}>
      <button aria-label="뒤로" onClick={onBack} className="grid size-11 place-items-center rounded-full hover:bg-accent">
        <ChevronLeft className="size-6" />
      </button>
      <div className="flex items-center gap-1">{children}</div>
    </header>
  )
}
