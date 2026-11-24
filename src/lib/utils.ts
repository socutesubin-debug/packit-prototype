import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const yen = (n: number) => `¥${Math.round(n).toLocaleString('ko-KR')}`
export const won = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`
/** rate = KRW per 100 JPY */
export const toWon = (yenAmount: number, rate: number) => (yenAmount * rate) / 100

export const TODAY = new Date(2026, 10, 24)

export function dday(start: string) {
  const [y, m, d] = start.split('-').map(Number)
  const diff = Math.round((new Date(y, m - 1, d).getTime() - TODAY.getTime()) / 86400000)
  if (diff > 0) return `D-${diff}`
  if (diff === 0) return 'D-DAY'
  return '여행 완료'
}

export function shortRange(start: string, end: string) {
  const f = (s: string) => {
    const [y, m, d] = s.split('-')
    return { y: y.slice(2), md: `${m}.${d}` }
  }
  const a = f(start)
  const b = f(end)
  return `${a.y}.${a.md} - ${b.md}`
}

export const uid = () => Math.random().toString(36).slice(2, 9)
