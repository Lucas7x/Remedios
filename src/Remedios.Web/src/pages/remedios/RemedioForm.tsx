import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { remediosApi } from '../../api/remedios'
import { receitasApi } from '../../api/receitas'

export function RemedioForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const isEdit = !!id

  const { data: remedio } = useQuery({
    queryKey: ['remedios', id],
    queryFn: () => remediosApi.buscar(Number(id)),
    enabled: isEdit,
  })

  const { data: receitas = [] } = useQuery({ queryKey: ['receitas'], queryFn: receitasApi.listar })

  const [form, setForm] = useState({
    nome: '', bula: '', quantidadeAtual: '', comprimidosPorDia: '', quantidadeMinima: '', receitaId: '',
  })

  useEffect(() => {
    if (remedio) setForm({
      nome: remedio.nome,
      bula: remedio.bula,
      quantidadeAtual: String(remedio.quantidadeAtual),
      comprimidosPorDia: String(remedio.comprimidosPorDia),
      quantidadeMinima: String(remedio.quantidadeMinima),
      receitaId: remedio.receitaId ? String(remedio.receitaId) : '',
    })
  }, [remedio])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const mutation = useMutation({
    mutationFn: () => isEdit
      ? remediosApi.atualizar(Number(id), {
          nome: form.nome, bula: form.bula,
          comprimidosPorDia: Number(form.comprimidosPorDia),
          quantidadeMinima: Number(form.quantidadeMinima),
          receitaId: form.receitaId ? Number(form.receitaId) : null,
        })
      : remediosApi.criar({
          nome: form.nome, bula: form.bula,
          quantidadeAtual: Number(form.quantidadeAtual),
          comprimidosPorDia: Number(form.comprimidosPorDia),
          quantidadeMinima: Number(form.quantidadeMinima),
          receitaId: form.receitaId ? Number(form.receitaId) : null,
        }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['remedios'] }); navigate('/remedios') },
  })

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/remedios')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{isEdit ? 'Editar Remédio' : 'Novo Remédio'}</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className={labelCls}>Nome *</label>
          <input className={inputCls} value={form.nome} onChange={e => set('nome', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Bula / Função</label>
          <textarea className={inputCls} rows={3} value={form.bula} onChange={e => set('bula', e.target.value)} />
        </div>
        {!isEdit && (
          <div>
            <label className={labelCls}>Quantidade inicial *</label>
            <input type="number" min="0" className={inputCls} value={form.quantidadeAtual} onChange={e => set('quantidadeAtual', e.target.value)} />
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Comprimidos por dia *</label>
            <input type="number" min="0" step="0.5" className={inputCls} value={form.comprimidosPorDia} onChange={e => set('comprimidosPorDia', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Qtd. mínima (alerta) *</label>
            <input type="number" min="0" className={inputCls} value={form.quantidadeMinima} onChange={e => set('quantidadeMinima', e.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Receita associada</label>
          <select className={inputCls} value={form.receitaId} onChange={e => set('receitaId', e.target.value)}>
            <option value="">Sem receita</option>
            {receitas.map(r => (
              <option key={r.id} value={r.id}>{r.descricao}</option>
            ))}
          </select>
        </div>

        {mutation.isError && (
          <p className="text-sm text-red-500">Erro ao salvar. Verifique os campos.</p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={() => navigate('/remedios')} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
            Cancelar
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !form.nome || !form.comprimidosPorDia}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
