import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, CheckCircle, Clock, TrendingDown } from 'lucide-react'
import { sistemaApi } from '../api/sistema'
import { Badge } from '../components/Badge'

export function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['abertura'],
    queryFn: sistemaApi.registrarAbertura,
    staleTime: Infinity,
  })

  if (isLoading) return <div className="text-gray-500">Calculando consumo...</div>
  if (error) return <div className="text-red-500">Erro ao carregar dados. A API está rodando?</div>

  const criticos = data!.remedios.filter(r => r.critico)
  const ok = data!.remedios.filter(r => !r.critico)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Última abertura: {new Date(data!.ultimaAbertura).toLocaleString('pt-BR')}
          {data!.diasDecorridos > 0 && (
            <span className="ml-2 text-amber-600 font-medium">
              · {data!.diasDecorridos} dia{data!.diasDecorridos > 1 ? 's' : ''} de consumo calculado
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Clock size={16} /> Total de remédios
          </div>
          <p className="text-3xl font-bold text-gray-800">{data!.remedios.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-4">
          <div className="flex items-center gap-2 text-red-500 text-sm mb-1">
            <AlertTriangle size={16} /> Estoque crítico
          </div>
          <p className="text-3xl font-bold text-red-600">{criticos.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-green-200 p-4">
          <div className="flex items-center gap-2 text-green-500 text-sm mb-1">
            <CheckCircle size={16} /> Estoque ok
          </div>
          <p className="text-3xl font-bold text-green-600">{ok.length}</p>
        </div>
      </div>

      {criticos.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-red-600 mb-3 flex items-center gap-2">
            <AlertTriangle size={18} /> Estoque crítico
          </h2>
          <div className="grid gap-3">
            {criticos.map(r => (
              <div key={r.id} className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{r.nome}</p>
                  <p className="text-sm text-gray-500">{r.comprimidosPorDia} comprimido(s)/dia</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">{r.quantidadeAtual}</p>
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <TrendingDown size={14} className="text-red-400" />
                    <span className="text-xs text-red-500">{r.diasRestantes} dia(s)</span>
                    <Badge variant="critico">Crítico</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {ok.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-gray-600 mb-3">Estoque normal</h2>
          <div className="grid gap-3">
            {ok.map(r => (
              <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{r.nome}</p>
                  <p className="text-sm text-gray-500">{r.comprimidosPorDia} comprimido(s)/dia</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-700">{r.quantidadeAtual}</p>
                  <span className="text-xs text-gray-400">{r.diasRestantes} dia(s)</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {data!.remedios.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          Nenhum remédio cadastrado ainda.
        </div>
      )}
    </div>
  )
}
