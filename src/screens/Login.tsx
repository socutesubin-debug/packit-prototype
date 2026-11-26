import { motion } from 'motion/react'
import bg from '@/assets/onb/login-bg.jpg'
import { useApp } from '@/lib/store'
import { cn } from '@/lib/utils'

/** 피그마 시안2 · 로그인 (480:3371) — 버튼 48 · 간격 12 · 좌우 20 */
export function Login() {
  const { setAuthed, open } = useApp()
  const start = () => {
    setAuthed(true)
    open({ type: 'create', first: true })
  }
  return (
    <div className="pk relative min-h-dvh overflow-hidden bg-[#C9C4F6]">
      <img src={bg} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-5 pt-[env(safe-area-inset-top)] pb-[max(36px,env(safe-area-inset-bottom))]">
        <div className="flex h-16 items-center justify-end">
          <button onClick={() => setAuthed(true)} className="t-label h-10 px-2 text-[#24222D]/60 hover:text-[#24222D]">
            둘러보기
          </button>
        </div>
        <motion.div className="mt-auto flex flex-col gap-3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <PillButton onClick={start} className="bg-[#24222D]">
            애플로 시작하기
          </PillButton>
          <PillButton onClick={start} className="bg-[#F3C768]">
            카카오톡으로 시작하기
          </PillButton>
        </motion.div>
      </div>
    </div>
  )
}

/** 362-버튼: h48 · radius full · Body-L 흰 글씨 */
export function PillButton({ className, disabled, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...p} disabled={disabled} className={cn('t-body-l flex h-12 w-full items-center justify-center rounded-full px-2 text-white transition active:scale-[0.99]', disabled && 'cursor-default', className)} />
}
