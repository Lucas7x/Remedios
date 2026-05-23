import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, PackageCheck } from 'lucide-react'
import { receitasApi } from '../../api/receitas'
import { remediosApi } from '../../api/remedios'
import { Modal } from '../../components/Modal'
import { Badge } from '../../components/Badge'

export function ReceberReceita() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const receitaId = Number(id)

  const { data: receita, isLoading: loadingReceita } = useQuery({
    queryKey: ['receitas', id],
    queryFn: () => receitasApi.buscar(receitaId),
  })

  const { data: todosRemedios = [], isLoading: loadingRemedios } = useQuery({
    queryKey: ['remedios'],
    queryFn: remediosApi.listar,
  })

  const remediosDaReceita = todosRemedios.filter(r => r.receitaId === receitaId)

  const [quantidades, setQuantidades] = useState<Record<number, string>>({})
  const [confirmarAberto, setConfirmarAberto] = useState(false)
  const [nomeUsuario, setNomeUsuario] = useState('')
  const [localGuardada, setLocalGuardada] = useState('')
  const [devolvida, setDevolvida] = useState(false)

  const algumPreenchido = Object.values(quantidades).some(v => Number(v) > 0)

  function abrirConfirmar() {
    setLocalGuardada(receita?.localGuardada ?? '')
    setDevolvida(receita?.devolvida ?? false)
    setConfirmarAberto(true)
  }

  const confirmarMutation = useMutation({
    mutationFn: async () => {
      const recebimentos = remediosDaReceita
        .filter(r => Number(quantidades[r.id]) > 0)
        .map(r => remediosApi.receber(r.id, {
          quantidadeRecebida: Number(quantidades[r.id]),
          nomeUsuario,
        }))

      await Promise.all(recebimentos)

      await receitasApi.atualizar(receitaId, {
        descricao: receita!.descricao,
        dataEmissao: receita!.dataEmissao,
        dataValidade: receita!.dataValidade,
        localGuardada,
        devolvida,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['remedios'] })
      qc.invalidateQueries({ queryKey: ['receitas'] })
      navigate('/receitas')
    },
  })

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  if (loadingReceita || loadingRemedios) return <div className="text-gray-500">Carregando...</div>

  if (!receita) return <div className="text-red-500">Receita não encontrada.</div>

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/receitas')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Receber remédios</h1>
          <p className="text-sm text-gray-500 mt-0.5">{receita.descricao}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 text-sm text-gray-600 flex gap-6">
        <span>Validade: <strong>{new Date(receita.dataValidade).toLocaleDateString('pt-BR')}</strong></span>
        <span>Usos anteriores: <strong>{receita.quantidadeUsos}</strong></span>
        {receita.vencida && <Badge variant="vencida">Vencida</Badge>}
      </div>

      {remediosDaReceita.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-200">
          Nenhum remédio associado a esta receita.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {remediosDaReceita.map(r => (
            <div key={r.id} className="flex items-center justify-between px-5 py-4 gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800">{r.nome}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Estoque atual: <strong>{r.quantidadeAtual}</strong> · {r.diasRestantes} dia(s)
                  {r.critico && <span className="ml-2 text-red-500 font-medium">⚠ Crítico</span>}
                </p>
              </div>
              <div className="w-28 shrink-0">
                <label className="block text-xs text-gray-500 mb-1">Qtd. recebida</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={quantidades[r.id] ?? ''}
                  onChange={e => setQuantidades(q => ({ ...q, [r.id]: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={abrirConfirmar}
          disabled={!algumPreenchido}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <PackageCheck size={16} /> Prosseguir
        </button>
      </div>

      {confirmarAberto && (
        <Modal title="Confirmar recebimento" onClose={() => setConfirmarAberto(false)}>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 space-y-1">
              {remediosDaReceita
                .filter(r => Number(quantidades[r.id]) > 0)
                .map(r => (
                  <div key={r.id} className="flex justify-between">
                    <span>{r.nome}</span>
                    <span className="font-semibold text-gray-800">+{quantidades[r.id]}</span>
                  </div>
                ))}
            </div>

            <div>
              <label className={labelCls}>Nome de quem retirou *</label>
              <input
                className={inputCls}
                value={nomeUsuario}
                onChange={e => setNomeUsuario(e.target.value)}
                placeholder="Ex: Maria"
              />
            </div>

            <div>
              <label className={labelCls}>Local onde a receita foi guardada</label>
              <input
                className={inputCls}
                value={localGuardada}
                onChange={e => setLocalGuardada(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="devolvida"
                checked={devolvida}
                onChange={e => setDevolvida(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="devolvida" className="text-sm text-gray-700">Receita devolvida à farmácia</label>
            </div>

            {confirmarMutation.isError && (
              <p className="text-sm text-red-500">
                {(confirmarMutation.error as Error)?.message ?? 'Erro ao salvar.'}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmarAberto(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Voltar
              </button>
              <button
                onClick={() => confirmarMutation.mutate()}
                disabled={confirmarMutation.isPending || !nomeUsuario}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {confirmarMutation.isPending ? 'Salvando...' : 'Confirmar recebimento'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
