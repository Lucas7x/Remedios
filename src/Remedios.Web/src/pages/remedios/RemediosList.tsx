import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, PackagePlus, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { remediosApi } from '../../api/remedios'
import { Badge } from '../../components/Badge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { Modal } from '../../components/Modal'
import type { Remedio } from '../../types'

export function RemediosList() {
  const qc = useQueryClient()
  const { data: remedios = [], isLoading } = useQuery({ queryKey: ['remedios'], queryFn: remediosApi.listar })

  const [excluindo, setExcluindo] = useState<Remedio | null>(null)
  const [recebendo, setRecebendo] = useState<Remedio | null>(null)
  const [adicionando, setAdicionando] = useState<Remedio | null>(null)

  const excluirMutation = useMutation({
    mutationFn: (id: number) => remediosApi.excluir(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['remedios'] }); setExcluindo(null) },
  })

  const receberMutation = useMutation({
    mutationFn: ({ id, qtd, nome }: { id: number; qtd: number; nome: string }) =>
      remediosApi.receber(id, { quantidadeRecebida: qtd, nomeUsuario: nome }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['remedios'] }); setRecebendo(null) },
  })

  const adicionarMutation = useMutation({
    mutationFn: ({ id, qtd, obs }: { id: number; qtd: number; obs: string }) =>
      remediosApi.adicionar(id, { quantidade: qtd, observacao: obs }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['remedios'] }); setAdicionando(null) },
  })

  if (isLoading) return <div className="text-gray-500">Carregando...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Remédios</h1>
        <Link to="/remedios/novo" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
          <Plus size={16} /> Novo Remédio
        </Link>
      </div>

      {remedios.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Nenhum remédio cadastrado.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-center">Quantidade</th>
                <th className="px-4 py-3 text-center">Dias restantes</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {remedios.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{r.nome}</p>
                    <p className="text-xs text-gray-400">{r.comprimidosPorDia} comp./dia · mín. {r.quantidadeMinima}</p>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-700">{r.quantidadeAtual}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{r.diasRestantes}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={r.critico ? 'critico' : 'ok'}>{r.critico ? 'Crítico' : 'OK'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setRecebendo(r)} title="Receber via receita" className="p-1.5 text-blue-500 hover:bg-blue-50 rounded">
                        <ShoppingBag size={15} />
                      </button>
                      <button onClick={() => setAdicionando(r)} title="Adicionar avulso" className="p-1.5 text-green-500 hover:bg-green-50 rounded">
                        <PackagePlus size={15} />
                      </button>
                      <Link to={`/remedios/${r.id}`} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded">
                        <Pencil size={15} />
                      </Link>
                      <button onClick={() => setExcluindo(r)} className="p-1.5 text-red-400 hover:bg-red-50 rounded">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {excluindo && (
        <ConfirmDialog
          title="Excluir remédio"
          message={`Deseja excluir "${excluindo.nome}"? Esta ação não pode ser desfeita.`}
          loading={excluirMutation.isPending}
          onConfirm={() => excluirMutation.mutate(excluindo.id)}
          onCancel={() => setExcluindo(null)}
        />
      )}

      {recebendo && (
        <ReceberModal remedio={recebendo} onClose={() => setRecebendo(null)}
          onSubmit={(qtd, nome) => receberMutation.mutate({ id: recebendo.id, qtd, nome })}
          loading={receberMutation.isPending}
          error={receberMutation.error as Error | null}
        />
      )}

      {adicionando && (
        <AdicionarModal remedio={adicionando} onClose={() => setAdicionando(null)}
          onSubmit={(qtd, obs) => adicionarMutation.mutate({ id: adicionando.id, qtd, obs })}
          loading={adicionarMutation.isPending}
        />
      )}
    </div>
  )
}

function ReceberModal({ remedio, onClose, onSubmit, loading, error }: {
  remedio: Remedio; onClose: () => void
  onSubmit: (qtd: number, nome: string) => void
  loading: boolean; error: Error | null
}) {
  const [qtd, setQtd] = useState('')
  const [nome, setNome] = useState('')
  return (
    <Modal title={`Receber — ${remedio.nome}`} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade recebida</label>
          <input type="number" min="1" value={qtd} onChange={e => setQtd(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome de quem retirou</label>
          <input type="text" value={nome} onChange={e => setNome(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        {error && <p className="text-sm text-red-500">{error.message}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
          <button onClick={() => onSubmit(Number(qtd), nome)} disabled={loading || !qtd || !nome}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Salvando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function AdicionarModal({ remedio, onClose, onSubmit, loading }: {
  remedio: Remedio; onClose: () => void
  onSubmit: (qtd: number, obs: string) => void
  loading: boolean
}) {
  const [qtd, setQtd] = useState('')
  const [obs, setObs] = useState('')
  return (
    <Modal title={`Adicionar comprimidos — ${remedio.nome}`} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
          <input type="number" min="1" value={qtd} onChange={e => setQtd(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observação (opcional)</label>
          <input type="text" value={obs} onChange={e => setObs(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
          <button onClick={() => onSubmit(Number(qtd), obs)} disabled={loading || !qtd}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
            {loading ? 'Salvando...' : 'Adicionar'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
