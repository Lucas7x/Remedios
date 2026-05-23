import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { RemediosList } from './pages/remedios/RemediosList'
import { RemedioForm } from './pages/remedios/RemedioForm'
import { ReceitasList } from './pages/receitas/ReceitasList'
import { ReceitaForm } from './pages/receitas/ReceitaForm'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/remedios" element={<RemediosList />} />
        <Route path="/remedios/novo" element={<RemedioForm />} />
        <Route path="/remedios/:id" element={<RemedioForm />} />
        <Route path="/receitas" element={<ReceitasList />} />
        <Route path="/receitas/nova" element={<ReceitaForm />} />
        <Route path="/receitas/:id" element={<ReceitaForm />} />
      </Routes>
    </Layout>
  )
}
