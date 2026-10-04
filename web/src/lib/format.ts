export function formatBRL(value: string | number): string {
  const n = typeof value === 'string' ? Number(value) : value
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/\u00a0/g, ' ')
}
