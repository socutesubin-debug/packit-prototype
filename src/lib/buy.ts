import { STORES } from './data'
import type { Find, Product, Store } from './types'

/** chains that typically carry a category (prototype data) */
export const CHAINS: Record<string, string[]> = {
  뷰티: ['드럭스토어', '돈키호테', '로프트'],
  식품: ['공항 면세점', '돈키호테', '편의점'],
  옷: ['백화점', '편집숍'],
  잡화: ['돈키호테', '로프트', '기념품점'],
  면세품: ['공항 면세점', '시내 면세점'],
}

export interface BuyInfo {
  find?: Find
  chains: string[]
  stores: Store[]
  cheapest?: { store: Store; price: number }
  nearest?: Store
  oneStop?: { store: Store; n: number }
  mustCount: number
}

/** "Where to buy" summary: exact shop for local finds, chains + cheapest/nearest + one-stop for everyday products */
export function buyInfo(p: Product, tripProducts: Product[], finds: Find[]): BuyInfo {
  const find = p.findId ? finds.find((f) => f.id === p.findId) : undefined
  const stores = STORES.filter((s) => p.storeIds.includes(s.id))
  const chains = CHAINS[p.category] ?? ['돈키호테', '드럭스토어']
  const nearest = [...stores].sort((a, b) => a.distance - b.distance)[0]
  const cheapestStore = stores.find((s) => s.kind === '잡화점') ?? stores[0]
  const cheapest = cheapestStore ? { store: cheapestStore, price: Math.round((p.price * 0.92) / 10) * 10 } : undefined
  const must = tripProducts.filter((x) => x.priority === 'must' && !x.purchased)
  const oneStop =
    !find && must.length >= 2
      ? stores
          .map((st) => ({ store: st, n: must.filter((x) => x.storeIds.includes(st.id)).length }))
          .sort((a, b) => b.n - a.n)
          .find((o) => o.n >= 2)
      : undefined
  return { find, chains, stores, cheapest, nearest, oneStop, mustCount: must.length }
}
