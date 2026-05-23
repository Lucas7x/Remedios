import client from './client'
import type { Receita, ReceitaCreateRequest, ReceitaUpdateRequest } from '../types'

export const receitasApi = {
  listar: () => client.get<Receita[]>('/receitas').then(r => r.data),
  buscar: (id: number) => client.get<Receita>(`/receitas/${id}`).then(r => r.data),
  criar: (data: ReceitaCreateRequest) => client.post<Receita>('/receitas', data).then(r => r.data),
  atualizar: (id: number, data: ReceitaUpdateRequest) => client.put<Receita>(`/receitas/${id}`, data).then(r => r.data),
  excluir: (id: number) => client.delete(`/receitas/${id}`),
}
