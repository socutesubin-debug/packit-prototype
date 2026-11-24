import { motion } from 'motion/react'
import { Logo, Sticker } from '@/components/art/Stickers'
import { Suitcase } from '@/components/art/Suitcase'
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/store'
import type { StickerKind } from '@/lib/types'

const FLOAT: { kind: StickerKind; cls: string; d: number }[] = [
  { kind: 'tokyo', cls: 'left-[6%] top-[14%] w-24 -rotate-12', d: 0 },
  { kind: 'fuji', cls: 'right-[8%] top-[8%] w-20 rotate-6', d: 0.6 },
  { kind: 'onigiri', cls: 'right-[4%] bottom-[16%] w-20 rotate-12', d: 1.1 },
  { kind: 'tag', cls: 'left-[2%] bottom-[10%] w-24 -rotate-6', d: 0.3 },
]

export function Login() {
  const { setAuthed, open } = useApp()
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <section className="relative flex flex-1 items-center justify-center overflow-hidden px-6 pt-16 pb-6 lg:bg-brand lg:p-16">
        <div className="relative aspect-square w-full max-w-[360px] lg:max-w-[520px]">
          {FLOAT.map((f) => (
            <motion.div
              key={f.kind}
              className={`absolute ${f.cls}`}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
              transition={{ opacity: { delay: 0.2 + f.d * 0.3 }, scale: { delay: 0.2 + f.d * 0.3, type: 'spring' }, y: { duration: 4, repeat: Infinity, delay: f.d, ease: 'easeInOut' } }}
            >
              <Sticker kind={f.kind} />
            </motion.div>
          ))}
          <div className="absolute inset-0 grid place-items-center">
            <div className="relative w-[48%]">
              <Suitcase color="#C9CBCF" className="w-full" id="login" />
              <motion.div className="absolute top-[30%] left-1/2 w-[64%] -translate-x-1/2" initial={{ rotate: -30, scale: 0 }} animate={{ rotate: -8, scale: 1 }} transition={{ delay: 0.35, type: 'spring', stiffness: 260, damping: 14 }}>
                <Logo className="w-full" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      <section className="flex flex-col justify-end px-6 pb-[max(28px,env(safe-area-inset-bottom))] lg:w-[480px] lg:justify-center lg:px-14">
        <div className="mb-10 text-center lg:text-left">
          <h1 className="display text-[40px] lg:text-[52px]">Packit</h1>
          <p className="mt-2 text-[16px] font-medium text-ink-2">여행을 캐리어에 담아</p>
          <p className="mt-1 text-[14px] text-muted">사고 싶은 건 저장하고, 현지에서 바로 찾아요</p>
        </div>
        <div className="flex flex-col gap-2.5">
          <Button
            variant="dark"
            size="lg"
            onClick={() => {
              setAuthed(true)
              open({ type: 'create' })
            }}
          >
            <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden>
              <path d="M16.4 12.6c0-2.5 2-3.7 2.1-3.8-1.2-1.7-3-1.9-3.6-1.9-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.9-1.1-2.9-4.2zM13.9 5.2c.7-.8 1.2-2 1-3.2-1 0-2.2.7-3 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.3-.5 3-1.3z" />
            </svg>
            애플로 시작하기
          </Button>
          <Button
            variant="kakao"
            size="lg"
            onClick={() => {
              setAuthed(true)
              open({ type: 'create' })
            }}
          >
            <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden>
              <path d="M12 3C6.5 3 2 6.5 2 10.8c0 2.8 1.9 5.2 4.7 6.6l-1 3.6c-.1.3.3.6.6.4l4.2-2.8c.5.1 1 .1 1.5.1 5.5 0 10-3.5 10-7.9S17.5 3 12 3z" />
            </svg>
            카카오로 시작하기
          </Button>
          <button onClick={() => setAuthed(true)} className="mt-2 h-11 text-[14px] font-semibold text-muted underline-offset-4 hover:underline">
            로그인 없이 예시 여행 둘러보기
          </button>
        </div>
      </section>
    </div>
  )
}
