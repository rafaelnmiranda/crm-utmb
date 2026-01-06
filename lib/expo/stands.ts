export type StandCode =
  | 'A01' | 'A02' | 'A03' | 'A04' | 'A05'
  | 'B01' | 'B02' | 'B03'
  | 'C01' | 'C02' | 'C03' | 'C04' | 'C05'
  | 'D01' | 'D02' | 'D03' | 'D04' | 'D05' | 'D06' | 'D07' | 'D08'
  | 'E01' | 'E02' | 'E03' | 'E04' | 'E05' | 'E06' | 'E07' | 'E08' | 'E09' | 'E10' | 'E11' | 'E12' | 'E13'
  | 'F01' | 'F02' | 'F03' | 'F04' | 'F05' | 'F06' | 'F07' | 'F08'

export const STANDS: StandCode[] = [
  'A01', 'A02', 'A03', 'A04', 'A05',
  'B01', 'B02', 'B03',
  'C01', 'C02', 'C03', 'C04', 'C05',
  'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08',
  'E01', 'E02', 'E03', 'E04', 'E05', 'E06', 'E07', 'E08', 'E09', 'E10', 'E11', 'E12', 'E13',
  'F01', 'F02', 'F03', 'F04', 'F05', 'F06', 'F07', 'F08',
]

/**
 * Stand E01 é a Loja Oficial UTMB - sempre deve ter cor especial
 */
export const OFFICIAL_STORE_STAND: StandCode = 'E01'

export function isValidStandLocation(value: unknown): value is StandCode {
  return typeof value === 'string' && (STANDS as readonly string[]).includes(value)
}

/**
 * Parses a free-form input (e.g. "Stand A01", "a01") into a normalized StandCode.
 * Returns null when invalid or not present.
 */
export function parseStandLocation(value: unknown): StandCode | null {
  if (value === null || value === undefined) return null
  if (typeof value !== 'string') return null

  const raw = value.trim().toUpperCase()
  if (!raw) return null

  // Common patterns: "A01", "Stand A01", "A 01"
  const match = raw.match(/([A-F])\s*0?(\d{1,2})/)
  if (!match) return null

  const letter = match[1]
  const num = match[2].padStart(2, '0')
  const normalized = `${letter}${num}`
  return isValidStandLocation(normalized) ? (normalized as StandCode) : null
}

export type StandRect = { xPct: number; yPct: number; wPct: number; hPct: number }

/**
 * Overlay rectangles (percent-based) baseado no layout técnico real.
 * Dimensões dos stands:
 * - A1-A5: 5 stands de 4x5m (4m largura, 5m altura) - proporção 0.8
 * - C1-C5: 5 stands de 4x5m (4m largura, 5m altura) - proporção 0.8
 * - B1: 6x10m (6m largura, 10m altura) - proporção 0.6
 * - B2, B3: 2 stands de 6x5m (6m largura, 5m altura) - proporção 1.2
 * - D1-D8: 8 stands de 4x5m (4m largura, 5m altura) - proporção 0.8
 * - F1-F8: 8 stands de 4x5m (4m largura, 5m altura) - proporção 0.8
 * - E1: Loja Oficial UTMB - 16x6m (16m largura, 6m altura)
 * - E2-E9: 8 stands de 4x3m (4m largura, 3m altura) - proporção 1.33
 * 
 * Layout aproximado baseado no desenho técnico:
 * - Largura total: ~92.85m
 * - Altura total: ~23m
 * 
 * Para manter proporções corretas visualmente, ajustamos considerando o aspect ratio do mapa
 */
export const STAND_COORDS: Record<StandCode, StandRect> = {
  // Fileira A (superior esquerda) - 5 stands de 4x5m
  // Ajustado para parecer quase quadrado visualmente (compensando aspect ratio do container)
  // Container aspect ratio ~4.04, então aumentamos largura para compensar
  A01: { xPct: 0.54, yPct: 2.17, wPct: 5.4, hPct: 21.74 }, // 4x5m - ajustado visual
  A02: { xPct: 5.94, yPct: 2.17, wPct: 5.4, hPct: 21.74 }, // 4x5m
  A03: { xPct: 11.34, yPct: 2.17, wPct: 5.4, hPct: 21.74 }, // 4x5m
  A04: { xPct: 16.74, yPct: 2.17, wPct: 5.4, hPct: 21.74 }, // 4x5m
  A05: { xPct: 22.14, yPct: 2.17, wPct: 5.4, hPct: 21.74 }, // 4x5m

  // Fileira B (meio esquerda) - centralizado verticalmente entre extremidades
  // B1: aumentado para que B3 se alinhe com A5
  // B2 e B3: 6x5m cada (6m largura, 5m altura)
  // Todos alinhados na mesma linha horizontal e mesma altura
  // Centralizado: A/D terminam em 23.91%, C/F começam em 73.91%, meio = 48.91%
  // A5 termina em 27.54%, então B3 deve terminar em 27.54%
  B01: { xPct: 0.54, yPct: 38.04, wPct: 14.08, hPct: 21.74 }, // Aumentado para alinhar B3 com A5
  B02: { xPct: 14.62, yPct: 38.04, wPct: 6.46, hPct: 21.74 }, // 6x5m - reposicionado
  B03: { xPct: 21.08, yPct: 38.04, wPct: 6.46, hPct: 21.74 }, // 6x5m - alinhado com A5 (termina em 27.54%)

  // Fileira C (inferior esquerda) - 5 stands de 4x5m
  // Mesma estrutura que A, mas mais abaixo
  C01: { xPct: 0.54, yPct: 73.91, wPct: 5.4, hPct: 21.74 }, // 4x5m - ajustado visual
  C02: { xPct: 5.94, yPct: 73.91, wPct: 5.4, hPct: 21.74 }, // 4x5m
  C03: { xPct: 11.34, yPct: 73.91, wPct: 5.4, hPct: 21.74 }, // 4x5m
  C04: { xPct: 16.74, yPct: 73.91, wPct: 5.4, hPct: 21.74 }, // 4x5m
  C05: { xPct: 22.14, yPct: 73.91, wPct: 5.4, hPct: 21.74 }, // 4x5m

  // Fileira D (superior direita) - 8 stands de 4x5m
  // Começam após o palco com espaçamento
  D01: { xPct: 38.1, yPct: 2.17, wPct: 5.4, hPct: 21.74 }, // 4x5m - ajustado visual, com espaço após palco
  D02: { xPct: 43.5, yPct: 2.17, wPct: 5.4, hPct: 21.74 }, // 4x5m
  D03: { xPct: 48.9, yPct: 2.17, wPct: 5.4, hPct: 21.74 }, // 4x5m
  D04: { xPct: 54.3, yPct: 2.17, wPct: 5.4, hPct: 21.74 }, // 4x5m
  D05: { xPct: 59.7, yPct: 2.17, wPct: 5.4, hPct: 21.74 }, // 4x5m
  D06: { xPct: 65.1, yPct: 2.17, wPct: 5.4, hPct: 21.74 }, // 4x5m
  D07: { xPct: 70.5, yPct: 2.17, wPct: 5.4, hPct: 21.74 }, // 4x5m
  D08: { xPct: 75.9, yPct: 2.17, wPct: 5.4, hPct: 21.74 }, // 4x5m

  // Fileira E (meio direita) - centralizado verticalmente entre extremidades
  // E1: Loja Oficial UTMB - ajustado para alinhar E11/E13 com D8
  // D8 termina em 81.3% (75.9 + 5.4), então E11/E13 devem terminar em 81.3%
  // E11 começa após E5 (76.93%) + E10 (5.4%) = 82.33%, então precisa reduzir E1
  // E5 termina em 76.93%, então E10+E11 ocupam 81.3 - 76.93 = 4.37% (muito pouco)
  // Melhor: reduzir E1 para que E10+E11 (10.8%) terminem em 81.3%
  // E5 termina em 76.93%, então E10 começa em 76.93%, E11 termina em 81.3%
  // E10+E11 = 4.37% total, então cada um tem ~2.185% (muito pequeno)
  // Alternativa: ajustar E1 para que E10 comece mais cedo
  // Se E10 começa em X e tem 5.4%, E11 termina em X+10.8 = 81.3%, então X = 70.5%
  // E5 deve terminar em 70.5%, então E5 começa em 65.1%
  // E1 deve terminar em 65.1%, então E1 tem largura 65.1 - 38.1 = 27%
  // Mas isso é muito grande... melhor manter E1 menor e ajustar
  // Vamos: E1 termina em 55.33 (onde E2 começa), então E1 tem 17.23% (mantém)
  // E5 termina em 76.93%, E10 começa em 76.93%, E11 termina em 82.33%
  // Para E11 terminar em 81.3%, preciso que E10 comece em 75.9%
  // Então E5 deve terminar em 75.9%, então E5 começa em 70.5%
  // E1 deve terminar em 55.33 (mantém), então E2-E5 ocupam 75.9 - 55.33 = 20.57%
  // Cada um tem 5.4%, então 4 stands = 21.6% (muito próximo)
  // Ajuste fino: E1 reduzido para que E2 comece mais cedo
  // D8 termina em 81.3%, queremos E11 terminar em 81.3%
  // E11 termina em: posição_E10 + 5.4 + 5.4 = posição_E10 + 10.8
  // posição_E10 = 81.3 - 10.8 = 70.5%
  // E5 termina em 70.5%, então E5 começa em 65.1%
  // E2-E5 ocupam 70.5 - posição_E2, então posição_E2 = 70.5 - 21.6 = 48.9%
  // E1 termina em 48.9%, então E1 tem largura 48.9 - 38.1 = 10.8%
  E01: { xPct: 38.1, yPct: 38.04, wPct: 10.8, hPct: 21.74 }, // Ajustado para alinhar E11/E13 com D8
  // E2-E13: stands de 4x3m (menores, ao lado de E1)
  // E2+E6 devem ter altura total igual a E1 (21.74%), então cada um tem 10.87%
  E02: { xPct: 48.9, yPct: 38.04, wPct: 5.4, hPct: 10.87 }, // 4x3m - altura ajustada
  E03: { xPct: 54.3, yPct: 38.04, wPct: 5.4, hPct: 10.87 }, // 4x3m
  E04: { xPct: 59.7, yPct: 38.04, wPct: 5.4, hPct: 10.87 }, // 4x3m
  E05: { xPct: 65.1, yPct: 38.04, wPct: 5.4, hPct: 10.87 }, // 4x3m
  E10: { xPct: 70.5, yPct: 38.04, wPct: 5.4, hPct: 10.87 }, // 4x3m - novo stand
  E11: { xPct: 75.9, yPct: 38.04, wPct: 5.4, hPct: 10.87 }, // 4x3m - novo stand, alinhado com D8
  E06: { xPct: 48.9, yPct: 48.91, wPct: 5.4, hPct: 10.87 }, // 4x3m - altura ajustada (E2+E6 = E1)
  E07: { xPct: 54.3, yPct: 48.91, wPct: 5.4, hPct: 10.87 }, // 4x3m
  E08: { xPct: 59.7, yPct: 48.91, wPct: 5.4, hPct: 10.87 }, // 4x3m
  E09: { xPct: 65.1, yPct: 48.91, wPct: 5.4, hPct: 10.87 }, // 4x3m
  E12: { xPct: 70.5, yPct: 48.91, wPct: 5.4, hPct: 10.87 }, // 4x3m - novo stand
  E13: { xPct: 75.9, yPct: 48.91, wPct: 5.4, hPct: 10.87 }, // 4x3m - novo stand, alinhado com D8

  // Fileira F (inferior direita) - 8 stands de 4x5m
  F01: { xPct: 38.1, yPct: 73.91, wPct: 5.4, hPct: 21.74 }, // 4x5m - ajustado visual, alinhado com D
  F02: { xPct: 43.5, yPct: 73.91, wPct: 5.4, hPct: 21.74 }, // 4x5m
  F03: { xPct: 48.9, yPct: 73.91, wPct: 5.4, hPct: 21.74 }, // 4x5m
  F04: { xPct: 54.3, yPct: 73.91, wPct: 5.4, hPct: 21.74 }, // 4x5m
  F05: { xPct: 59.7, yPct: 73.91, wPct: 5.4, hPct: 21.74 }, // 4x5m
  F06: { xPct: 65.1, yPct: 73.91, wPct: 5.4, hPct: 21.74 }, // 4x5m
  F07: { xPct: 70.5, yPct: 73.91, wPct: 5.4, hPct: 21.74 }, // 4x5m
  F08: { xPct: 75.9, yPct: 73.91, wPct: 5.4, hPct: 21.74 }, // 4x5m
}


