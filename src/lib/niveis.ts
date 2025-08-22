/**
 * Calcula o nível de criador baseado na pontuação
 * @param pontuacao - Pontuação atual do criador
 * @returns Nível do criador
 */
export function calcularNivelCriador(pontuacao: number): string {
  if (pontuacao >= 10000) {
    return 'criador-supremo'
  } else if (pontuacao >= 5000) {
    return 'criador-parceiro'
  } else if (pontuacao >= 1000) {
    return 'criador-comum'
  } else {
    return 'criador-iniciante'
  }
}

/**
 * Obtém a cor do nível para exibição
 * @param nivel - Nível do criador
 * @returns Classe CSS para cor
 */
export function getNivelColor(nivel: string): string {
  switch (nivel) {
    case 'criador-supremo':
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    case 'criador-parceiro':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    case 'criador-comum':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    case 'criador-iniciante':
      return 'bg-green-500/20 text-green-300 border-green-500/30'
    case 'parceiro':
      return 'bg-orange-500/20 text-orange-300 border-orange-500/30'
    case 'usuario':
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }
}

/**
 * Obtém o label do nível para exibição
 * @param nivel - Nível do criador
 * @returns Label formatado
 */
export function getNivelLabel(nivel: string): string {
  switch (nivel) {
    case 'criador-supremo':
      return 'Supremo'
    case 'criador-parceiro':
      return 'Parceiro'
    case 'criador-comum':
      return 'Comum'
    case 'criador-iniciante':
      return 'Iniciante'
    case 'parceiro':
      return 'Parceiro'
    case 'usuario':
      return 'Usuário'
    default:
      return nivel
  }
}
