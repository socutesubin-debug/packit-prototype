import type { Product, Review } from './types'

/** words travelers mention most, per category (prototype data) */
export const KEYWORDS: Record<string, string[]> = {
  식품: ['선물용', '맛', '포장', '유통기한'],
  뷰티: ['발림성', '가성비', '향', '면세'],
  잡화: ['디자인', '선물용', '가성비'],
  면세품: ['선물용', '보냉', '맛'],
  옷: ['사이즈', '소재', '디자인'],
}

type R = Review & { ago: string }
const POOL: Record<string, R[]> = {
  식품: [
    { user: '여행하는곰', trip: '도쿄 25.11', ago: '1주 전', mood: 'good', text: '회사 선물용으로 5박스 샀어요. 개별 포장이라 나눠 주기 편했고 맛도 다들 좋아했어요.' },
    { user: '하루', trip: '오사카 25.10', ago: '3주 전', mood: 'good', text: '맛은 달달하고 바삭해요. 공항보다 돈키호테가 조금 더 쌌어요.' },
    { user: 'momo', trip: '도쿄 25.09', ago: '2달 전', mood: 'soso', text: '유통기한이 생각보다 짧아서 여행 마지막 날 사는 걸 추천해요.' },
    { user: '쭈니', trip: '후쿠오카 25.08', ago: '3달 전', mood: 'good', text: '포장이 귀여워서 선물용으로 딱이에요. 캐리어에 넣어도 안 부서졌어요.' },
  ],
  뷰티: [
    { user: '라라', trip: '도쿄 25.11', ago: '5일 전', mood: 'good', text: '발림성이 정말 가볍고 백탁이 없어요. 한국보다 가성비 좋아요.' },
    { user: 'sun', trip: '오사카 25.10', ago: '1달 전', mood: 'good', text: '면세 되는 드럭스토어에서 사면 훨씬 저렴해요. 향도 거의 없어요.' },
    { user: '도도', trip: '교토 25.09', ago: '2달 전', mood: 'soso', text: '향이 살짝 있어요. 민감하면 테스터 먼저 써 보세요.' },
  ],
  잡화: [
    { user: '키키', trip: '도쿄 25.11', ago: '2주 전', mood: 'good', text: '디자인이 예뻐서 선물용으로 여러 개 샀어요.' },
    { user: '오리', trip: '도쿄 25.10', ago: '1달 전', mood: 'good', text: '가성비 좋아요. 매장마다 색이 달라서 여러 곳 둘러봤어요.' },
  ],
  면세품: [
    { user: '봄봄', trip: '삿포로 25.11', ago: '1주 전', mood: 'good', text: '보냉 포장 해 줘서 집까지 멀쩡했어요. 선물용 최고.' },
    { user: '해피', trip: '도쿄 25.10', ago: '1달 전', mood: 'good', text: '맛은 말할 것도 없고, 공항 면세점에서 사는 게 편해요.' },
  ],
}

export interface ReviewView extends Review {
  ago: string
  tags: string[]
}

/** product's own reviews + category pool, each tagged with the keywords it mentions */
export function reviewsFor(p: Product): { list: ReviewView[]; keywords: { word: string; n: number }[]; likeRate: number } {
  const words = KEYWORDS[p.category] ?? []
  const own: R[] = p.reviews.map((r, i) => ({ ...r, ago: ['2일 전', '1주 전', '1달 전'][i] ?? '1달 전' }))
  const list = [...own, ...(POOL[p.category] ?? [])].map((r) => ({ ...r, tags: words.filter((w) => r.text.includes(w)) }))
  const keywords = words.map((word) => ({ word, n: list.filter((r) => r.tags.includes(word)).length })).filter((k) => k.n > 0).sort((a, b) => b.n - a.n)
  const likeRate = list.length ? Math.round((list.filter((r) => r.mood === 'good').length / list.length) * 100) : 0
  return { list, keywords, likeRate }
}
