import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Confetti, type ConfettiRef } from '@/components/magicui/confetti'
import { NumberTicker } from '@/components/magicui/number-ticker'
import { C } from './ui'

/*
 * Magic UI 포인트 연출 — 아트 디렉션 2판 §10, 딱 두 곳에서만 쓴다.
 *  1) 구매품이 캐리어에 담길 때: 컨페티
 *  2) 발견 올리기 보상: 넘버 티커(+50P) + 컨페티
 * 색은 브랜드 보라 + 중성색만. Reduce Motion이면 컨페티는 생략하고 결과(숫자·문구)는 그대로 보여 준다.
 */
const COLORS = [C.fab, C.brandStrong, '#C7C7CC', '#737370']

let fireRef: ConfettiRef | null = null
let showReward: ((p: number) => void) | null = null

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** 구매품이 캐리어에 담길 때 */
export function celebrateCarry() {
  if (reduced()) return
  fireRef?.fire({ particleCount: 60, spread: 64, startVelocity: 28, origin: { y: 0.82 }, colors: COLORS, scalar: 0.8, ticks: 160 })
}

/** 발견 올리기 보상 */
export function celebrateReward(points = 50) {
  showReward?.(points)
  if (reduced()) return
  window.setTimeout(() => fireRef?.fire({ particleCount: 80, spread: 80, startVelocity: 30, origin: { y: 0.46 }, colors: COLORS, scalar: 0.8, ticks: 180 }), 320)
}

/** App 맨 위에 한 번만 둔다 */
export function CelebrationLayer() {
  const ref = useRef<ConfettiRef>(null)
  const [reward, setReward] = useState<number | null>(null)
  useEffect(() => {
    fireRef = ref.current
    showReward = (p) => setReward(p)
    return () => {
      fireRef = null
      showReward = null
    }
  })
  useEffect(() => {
    if (reward == null) return
    const t = window.setTimeout(() => setReward(null), 2200)
    return () => window.clearTimeout(t)
  }, [reward])
  return (
    <>
      <Confetti ref={ref} manualstart className="pointer-events-none fixed inset-0 z-[120] size-full" />
      <AnimatePresence>
        {reward != null && (
          <motion.div
            role="status"
            aria-live="polite"
            className="pk pointer-events-none fixed inset-x-0 top-[38%] z-[119] flex justify-center"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div className="flex flex-col items-center gap-1 rounded-[28px] bg-white px-10 py-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
              <p className="t-label" style={{ color: C.sub }}>
                발견을 올렸어요
              </p>
              <p className="text-[40px] leading-[48px] font-bold tabular-nums" style={{ color: C.brandStrong }}>
                +<NumberTicker value={reward} className="tabular-nums" style={{ color: C.brandStrong }} />P
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
