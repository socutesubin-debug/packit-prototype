export type Priority = 'must' | 'maybe' | 'skip'
export type Category = '뷰티' | '식품' | '옷' | '잡화' | '면세품'

export type ArtShape = 'box' | 'tube' | 'bottle' | 'pouch' | 'jar' | 'towel' | 'can' | 'bar'
export interface Art {
  shape: ArtShape
  color: string
  accent: string
  bg: string
}

export interface Review {
  user: string
  trip: string
  mood: 'good' | 'soso' | 'bad'
  text: string
}

export interface Product {
  id: string
  tripId: string
  name: string
  ja: string
  brand: string
  category: Category
  price: number
  desc: string
  art: Art
  priority: Priority | null
  favorite: boolean
  memo: string
  purchased: boolean
  myMood?: Review['mood']
  storeIds: string[]
  pickRate: number
  reviews: Review[]
  findId?: string
  qty?: number
}

export type SuitcaseModel = 'ribbed' | 'classic' | 'soft'
export interface PlacedSticker {
  id: string
  kind: StickerKind
  x: number
  y: number
  rot: number
}
export type StickerKind = 'tokyo' | 'packit' | 'fuji' | 'sakura' | 'tag' | 'ticket' | 'onigiri' | 'osaka' | 'postit' | 'fragile' | 'tower' | 'cat'

export interface Trip {
  id: string
  name: string
  city: string
  start: string
  end: string
  budget: number
  suitcase: { model: SuitcaseModel; color: string }
  stickers: PlacedSticker[]
  sample?: boolean
}

export interface Store {
  id: string
  name: string
  ja: string
  kind: string
  area: string
  address: string
  hours: string
  open: boolean
  distance: number
  x: number
  y: number
  color: string
}

/** A "local find": an item you can only get in that place, posted by a traveler */
export interface Find {
  id: string
  city: string
  title: string
  story: string
  place: string
  area: string
  x: number
  y: number
  price?: number
  category: Category
  art: Art
  photo?: string
  author: string
  authorTrip: string
  daysAgo: number
  saves: number
  thanks: number
  mine?: boolean
  sample?: boolean
  /** 발견 · 한 줄 팁 · 쇼핑 코스 · 물어보기 */
  kind?: PostKind
  /** 발견 당시 날짜 (MM.DD) */
  date?: string
  /** numbered pins on the cover photo */
  pins?: PhotoPin[]
  subtitle?: string
  /** traveler series (브런치북) this post belongs to */
  seriesId?: string
}

export type PostKind = 'find' | 'tip' | 'course' | 'ask'
export interface PhotoPin {
  x: number
  y: number
  label: string
  price?: number
}
export interface Comment {
  id: string
  user: string
  text: string
  ago: string
  mine?: boolean
}

export interface TravelerSeries {
  id: string
  author: string
  title: string
  desc: string
  city: string
  subs: number
  eps: { title: string; spent?: number; stores?: number; findId?: string }[]
  ongoing?: boolean
}
export interface Author {
  name: string
  bio: string
  subs: number
  cities: string[]
}
