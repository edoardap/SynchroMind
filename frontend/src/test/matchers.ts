/** Casa o elemento cujo texto completo (incluindo filhos) é exatamente `text`. Útil quando o número vem em negrito. */
export function textOf(text: string) {
  return (_content: string, element: Element | null) =>
    !!element && (element.textContent ?? '').replace(/\s+/g, ' ').trim() === text && element.children.length <= 2
}
