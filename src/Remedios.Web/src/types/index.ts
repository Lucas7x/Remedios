export interface Remedio {
  id: number
  nome: string
  bula: string
  quantidadeAtual: number
  comprimidosPorDia: number
  quantidadeMinima: number
  receitaId: number | null
  critico: boolean
  diasRestantes: number
}

export interface RemedioCreateRequest {
  nome: string
  bula: string
  quantidadeAtual: number
  comprimidosPorDia: number
  quantidadeMinima: number
  receitaId: number | null
}

export interface RemedioUpdateRequest {
  nome: string
  bula: string
  comprimidosPorDia: number
  quantidadeMinima: number
  receitaId: number | null
}

export interface ReceberRemedioRequest {
  quantidadeRecebida: number
  nomeUsuario: string
}

export interface AdicionarComprimidosRequest {
  quantidade: number
  observacao?: string
}

export interface Receita {
  id: number
  descricao: string
  dataEmissao: string
  dataValidade: string
  quantidadeUsos: number
  dataUltimoUso: string | null
  nomeUltimoUsuario: string | null
  localGuardada: string
  devolvida: boolean
  vencida: boolean
  nomesRemedios: string[]
}

export interface ReceitaCreateRequest {
  descricao: string
  dataEmissao: string
  dataValidade: string
  localGuardada: string
}

export interface ReceitaUpdateRequest {
  descricao: string
  dataEmissao: string
  dataValidade: string
  localGuardada: string
  devolvida: boolean
}

export interface AberturaSistemaResponse {
  diasDecorridos: number
  ultimaAbertura: string
  remedios: Remedio[]
}
