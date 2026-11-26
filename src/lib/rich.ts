/** 글쓰기 서식 — 아이폰 메모처럼 제목/소제목/본문/인용 + B I U S + 글자색 */

const BLOCKS = new Set(['P', 'DIV', 'H2', 'H3', 'BLOCKQUOTE', 'BR'])
const INLINE = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'SPAN', 'FONT', 'MARK'])

/** allowlist sanitizer: keeps only formatting tags and color styles */
export function sanitize(html: string): string {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html')
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return esc((node.textContent ?? '').replace(/\u200b/g, ''))
    if (node.nodeType !== Node.ELEMENT_NODE) return ''
    const el = node as HTMLElement
    const inner = Array.from(el.childNodes).map(walk).join('')
    const tag = el.tagName
    if (tag === 'BR') return '<br>'
    if (BLOCKS.has(tag)) {
      const t = tag === 'DIV' ? 'p' : tag.toLowerCase()
      return `<${t}${styleAttr(el)}>${inner}</${t}>`
    }
    if (INLINE.has(tag)) {
      const map: Record<string, string> = { STRONG: 'b', EM: 'i', STRIKE: 's', FONT: 'span', MARK: 'span' }
      const t = (map[tag] ?? tag).toLowerCase()
      const fontColor = tag === 'FONT' ? el.getAttribute('color') : null
      const st = styleAttr(el, fontColor)
      if (t === 'span' && !st) return inner
      return `<${t}${st}>${inner}</${t}>`
    }
    return inner
  }
  return Array.from(doc.body.firstChild?.childNodes ?? []).map(walk).join('')
}

const COLOR_RE = /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\))$/i
function styleAttr(el: HTMLElement, fontColor?: string | null) {
  const out: string[] = []
  const c = el.style.color || fontColor
  if (c && COLOR_RE.test(c.trim())) out.push(`color:${c.trim()}`)
  const bg = el.style.backgroundColor
  if (bg && COLOR_RE.test(bg.trim()) && bg !== 'transparent') out.push(`background-color:${bg.trim()}`)
  if (el.style.fontWeight === 'bold' || Number(el.style.fontWeight) >= 600) out.push('font-weight:700')
  if (el.style.fontStyle === 'italic') out.push('font-style:italic')
  const td = el.style.textDecorationLine || el.style.textDecoration
  if (/underline|line-through/.test(td)) out.push(`text-decoration:${td.match(/underline|line-through/g)!.join(' ')}`)
  return out.length ? ` style="${out.join(';')}"` : ''
}
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** plain text → editor html (for old drafts) */
export const textToHtml = (t: string) => (t.includes('<') ? t : t.split('\n').map((l) => (l.startsWith('>') ? `<blockquote>${esc(l.replace(/^>\s?/, ''))}</blockquote>` : `<p>${esc(l) || '<br>'}</p>`)).join(''))

export const htmlToText = (html: string) => {
  const doc = new DOMParser().parseFromString(html.replace(/<\/(p|h2|h3|blockquote)>/g, '\n$&'), 'text/html')
  return (doc.body.textContent ?? '').replace(/\u200b/g, '').replace(/\n{3,}/g, '\n\n').trim()
}

export const TEXT_COLORS = [
  { name: '기본', v: '#111111' },
  { name: '회색', v: '#92928C' },
  { name: '빨강', v: '#E5484D' },
  { name: '주황', v: '#F76B15' },
  { name: '초록', v: '#30A46C' },
  { name: '파랑', v: '#0090FF' },
  { name: '보라', v: '#8E4EC6' },
]
export const HILITE = '#DFFF3F'
