import client from './client'
import type { AberturaSistemaResponse } from '../types'

export const sistemaApi = {
  registrarAbertura: () => client.post<AberturaSistemaResponse>('/sistema/registrar-abertura').then(r => r.data),
}
