import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { receitasApi } from '../../api/receitas'

export function ReceitaForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const isEdit = !!id

  const { data: receita } = useQuery({
    queryKey: ['receitas', id],
    queryFn: () => receitasApi.buscar(Number(id)),
    enabled: isEdit,
  })

  const [form, setForm] = useState({
    descricao: '', dataEmissao: '', dataValidade: '', localGuardada: '', devolvida: false,
  })

  useEffect(() => {
    if (receita) setForm({
      descricao: receita.descricao,
      dataEmissao: receita.dataEmissao,
      dataValidade: receita.dataValidade,
      localGuardada: receita.localGuardada,
      devolvida: receita.devolvida,
    })
  }, [receita])

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  const mutation = useMutation({
    mutationFn: () => isEdit
      ? receitasApi.atualizar(Number(id), form)
      : receitasApi.criar({ descricao: form.descricao, dataEmissao: form.dataEmissao, dataValidade: form.dataValidade, localGuardada: form.localGuardada }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['receitas'] }); navigate('/receitas') },
  })

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/receitas')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{isEdit ? 'Editar Receita' : 'Nova Receita'}</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className={labelCls}>Descrição *</label>
          <input className={inputCls} value={form.descricao} onChange={e => set('descricao', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Data de emissão *</label>
            <input type="date" className={inputCls} value={form.dataEmissao} onChange={e => set('dataEmissao', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Data de validade *</label>
            <input type="date" className={inputCls} value={form.dataValidade} onChange={e => set('dataValidade', e.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Local onde está guardada *</label>
          <input className={inputCls} value={form.localGuardada} onChange={e => set('localGuardada', e.target.value)} />
        </div>
        {isEdit && (
          <div className="flex items-center gap-2">
            <input type="checkbox" id="devolvida" checked={form.devolvida} onChange={e => set('devolvida', e.target.checked)} className="rounded" />
            <label htmlFor="devolvida" className="text-sm text-gray-700">Receita devolvida</label>
          </div>
        )}

        {mutation.isError && <p className="text-sm text-red-500">Erro ao salvar.</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={() => navigate('/receitas')} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
            Cancelar
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !form.descricao || !form.dataEmissao || !form.dataValidade}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
