import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, PackageCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { receitasApi } from '../../api/receitas'
import { Badge } from '../../components/Badge'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import type { Receita } from '../../types'

export function ReceitasList() {
  const qc = useQueryClient()
  const { data: receitas = [], isLoading } = useQuery({ queryKey: ['receitas'], queryFn: receitasApi.listar })
  const [excluindo, setExcluindo] = useState<Receita | null>(null)

  const excluirMutation = useMutation({
    mutationFn: (id: number) => receitasApi.excluir(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['receitas'] }); setExcluindo(null) },
  })

  if (isLoading) return <div className="text-gray-500">Carregando...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Receitas</h1>
        <Link to="/receitas/nova" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
          <Plus size={16} /> Nova Receita
        </Link>
      </div>

      {receitas.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Nenhuma receita cadastrada.</div>
      ) : (
        <div className="grid gap-4">
          {receitas.map(r => (
            <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-800 truncate">{r.descricao}</p>
                    {r.vencida && <Badge variant="vencida">Vencida</Badge>}
                    {r.devolvida && <Badge variant="aviso">Devolvida</Badge>}
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-500 mt-2">
                    <span>Emissão: {new Date(r.dataEmissao).toLocaleDateString('pt-BR')}</span>
                    <span>Validade: {new Date(r.dataValidade).toLocaleDateString('pt-BR')}</span>
                    <span>Usos: {r.quantidadeUsos}</span>
                    <span>Local: {r.localGuardada}</span>
                    {r.dataUltimoUso && <span className="col-span-2">Último uso: {new Date(r.dataUltimoUso).toLocaleDateString('pt-BR')} por {r.nomeUltimoUsuario}</span>}
                  </div>
                  {r.nomesRemedios.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {r.nomesRemedios.map(n => (
                        <span key={n} className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded">{n}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    to={`/receitas/${r.id}/receber`}
                    title="Receber remédios"
                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"
                  >
                    <PackageCheck size={15} />
                  </Link>
                  <Link to={`/receitas/${r.id}`} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded">
                    <Pencil size={15} />
                  </Link>
                  <button onClick={() => setExcluindo(r)} className="p-1.5 text-red-400 hover:bg-red-50 rounded">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {excluindo && (
        <ConfirmDialog
          title="Excluir receita"
          message={`Deseja excluir "${excluindo.descricao}"?`}
          loading={excluirMutation.isPending}
          onConfirm={() => excluirMutation.mutate(excluindo.id)}
          onCancel={() => setExcluindo(null)}
        />
      )}
    </div>
  )
}
