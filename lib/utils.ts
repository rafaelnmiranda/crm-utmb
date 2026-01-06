import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calcula se uma cor é clara ou escura para determinar a cor do texto apropriada
 * @param hexColor - Cor em formato hexadecimal (ex: #FF5733, #fff, ou #abc)
 * @returns 'white' se a cor for escura, 'black' se for clara
 */
export function getTextColorForBackground(hexColor: string): 'white' | 'black' {
  if (!hexColor) return 'white'
  
  // Remove o # se presente
  let hex = hexColor.replace('#', '')
  
  // Se for formato curto (3 dígitos), expande para 6 dígitos
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('')
  }
  
  // Valida se tem 6 dígitos
  if (hex.length !== 6) {
    return 'white' // Default para texto branco se formato inválido
  }
  
  // Converte para RGB
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  // Calcula o brilho relativo usando a fórmula de luminância
  // Fórmula: 0.299*R + 0.587*G + 0.114*B
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  
  // Se o brilho for maior que 128, a cor é clara, então usa texto preto
  // Caso contrário, usa texto branco
  return brightness > 128 ? 'black' : 'white'
}

