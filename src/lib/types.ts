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
