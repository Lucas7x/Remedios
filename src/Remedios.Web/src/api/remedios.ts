import client from './client'
import type {
  Remedio,
  RemedioCreateRequest,
  RemedioUpdateRequest,
  ReceberRemedioRequest,
  AdicionarComprimidosRequest,
} from '../types'

export const remediosApi = {
  listar: () => client.get<Remedio[]>('/remedios').then(r => r.data),
  buscar: (id: number) => client.get<Remedio>(`/remedios/${id}`).then(r => r.data),
  criar: (data: RemedioCreateRequest) => client.post<Remedio>('/remedios', data).then(r => r.data),
  atualizar: (id: number, data: RemedioUpdateRequest) => client.put<Remedio>(`/remedios/${id}`, data).then(r => r.data),
  excluir: (id: number) => client.delete(`/remedios/${id}`),
  receber: (id: number, data: ReceberRemedioRequest) => client.post<Remedio>(`/remedios/${id}/receber`, data).then(r => r.data),
  adicionar: (id: number, data: AdicionarComprimidosRequest) => client.post(`/remedios/${id}/adicionar`, data).then(r => r.data),
}
