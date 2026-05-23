# Planejamento — Sistema de Controle de Remédios e Receitas

## 1. Visão Geral

Aplicação para controle de estoque de medicamentos e receitas médicas de um familiar.
Permite rastrear quantidades, associar medicamentos a receitas, registrar recebimentos em farmácia e alertar quando o estoque de um remédio está crítico.

---

## 2. Entidades

### 2.1 Remédio

| Campo               | Tipo            | Descrição                                                        |
|---------------------|-----------------|------------------------------------------------------------------|
| `Id`                | int             | Chave primária                                                   |
| `Nome`              | string          | Nome do medicamento (obrigatório)                                |
| `Bula`              | string          | Descrição/função do medicamento                                  |
| `QuantidadeAtual`   | decimal         | Quantidade de comprimidos em estoque                             |
| `ComprimidosPorDia` | decimal         | Quantidade consumida por dia (pode ser fracionada, ex: 0.5)      |
| `QuantidadeMinima`  | decimal         | Limite mínimo — abaixo disso o remédio é marcado como crítico    |
| `ReceitaId`         | int? (FK)       | Receita médica atual associada ao remédio (pode ser nula)        |
| `CriadoEm`          | DateTime        | Data de criação do registro                                      |
| `AtualizadoEm`      | DateTime        | Data da última atualização                                       |

**Notas:**
- `ComprimidosPorDia` aceita decimal para cobrir casos como "meio comprimido por dia".
- `QuantidadeMinima` é o gatilho para o alerta crítico. Valor padrão sugerido: 7 dias de estoque (`ComprimidosPorDia × 7`).
- `ReceitaId` é nullable — alguns medicamentos podem ser adquiridos sem receita.

---

### 2.2 Receita

| Campo               | Tipo            | Descrição                                                        |
|---------------------|-----------------|------------------------------------------------------------------|
| `Id`                | int             | Chave primária                                                   |
| `Descricao`         | string          | Descrição geral da receita                                       |
| `DataEmissao`       | DateOnly        | Data em que a receita foi emitida pelo médico                    |
| `DataValidade`      | DateOnly        | Data de validade da receita                                      |
| `QuantidadeUsos`    | int             | Contador de quantas vezes foi usada para retirar remédios        |
| `DataUltimoUso`     | DateOnly?       | Data da última retirada (null se nunca usada)                    |
| `NomeUltimoUsuario` | string?         | Nome de quem fez a última retirada (null se nunca usada)         |
| `LocalGuardada`     | string          | Descrição do local físico onde a receita está guardada           |
| `Devolvida`         | bool            | Indica se a receita já foi devolvida à farmácia/médico           |
| `CriadoEm`          | DateTime        | Data de criação do registro                                      |
| `AtualizadoEm`      | DateTime        | Data da última atualização                                       |

---

### 2.3 ControleAbertura

Tabela com **um único registro**, usada para calcular o consumo de remédios desde a última vez que a aplicação foi usada.

| Campo            | Tipo     | Descrição                                          |
|------------------|----------|----------------------------------------------------|
| `Id`             | int      | Sempre 1                                           |
| `UltimaAbertura` | DateTime | Timestamp da última vez que a aplicação foi aberta |

**Decisão de arquitetura:** optei por uma tabela separada em vez de colocar a data no remédio porque:
- A data de última abertura é um estado global da aplicação, não de um remédio específico.
- Evita dados redundantes (a mesma data repetida em todos os remédios).
- Facilita a manutenção: atualiza-se um único registro a cada abertura.

---

## 3. Relacionamentos

```
Receita  1 ──── N  Remédio
```

- Uma receita pode ser associada a vários remédios.
- Um remédio possui no máximo uma receita ativa (FK `ReceitaId` na tabela `Remédio`).
- Relação opcional: `ReceitaId` é nullable para remédios que não exigem receita.

---

## 4. Regras de Negócio

### RN-01 — Cálculo de consumo na abertura
Ao abrir o aplicativo:
1. Buscar `UltimaAbertura` da tabela `ControleAbertura`.
2. Calcular `diasDecorridos = (DateTime.Now - UltimaAbertura).TotalDays` (arredondado para dias inteiros).
3. Para cada remédio: `QuantidadeAtual -= diasDecorridos × ComprimidosPorDia`.
4. `QuantidadeAtual` nunca deve ficar negativa — aplicar `Math.Max(0, resultado)`.
5. Atualizar `UltimaAbertura` com o timestamp atual.
6. Retornar a lista de remédios com o campo `Critico = QuantidadeAtual < QuantidadeMinima`.

### RN-02 — Recebimento via receita
Ao registrar um recebimento:
1. Verificar se a receita associada ao remédio existe e não está vencida (`DataValidade >= hoje`).
2. Somar a quantidade recebida ao `QuantidadeAtual` do remédio.
3. Incrementar `QuantidadeUsos` da receita.
4. Atualizar `DataUltimoUso` e `NomeUltimoUsuario` da receita.

### RN-03 — Adição avulsa de comprimidos
Permite adicionar quantidade ao estoque sem estar vinculado a uma receita.
Útil para compras de balcão ou ajustes manuais de inventário.

### RN-04 — Alerta crítico
Retornado em qualquer consulta de remédio:
- `Critico = true` quando `QuantidadeAtual < QuantidadeMinima`.
- `DiasRestantes = QuantidadeAtual / ComprimidosPorDia` (campo calculado, não persiste no banco).

---

## 5. Endpoints da API

### Remédios

| Método | Rota                              | Descrição                                               |
|--------|-----------------------------------|---------------------------------------------------------|
| GET    | `/api/remedios`                   | Listar todos os remédios com status crítico calculado   |
| GET    | `/api/remedios/{id}`              | Buscar remédio por ID                                   |
| POST   | `/api/remedios`                   | Criar remédio                                           |
| PUT    | `/api/remedios/{id}`              | Atualizar remédio                                       |
| DELETE | `/api/remedios/{id}`              | Excluir remédio                                         |
| POST   | `/api/remedios/{id}/receber`      | Registrar recebimento via receita                       |
| POST   | `/api/remedios/{id}/adicionar`    | Adicionar comprimidos avulsos (sem receita)             |

### Receitas

| Método | Rota                   | Descrição               |
|--------|------------------------|-------------------------|
| GET    | `/api/receitas`        | Listar todas as receitas |
| GET    | `/api/receitas/{id}`   | Buscar receita por ID   |
| POST   | `/api/receitas`        | Criar receita           |
| PUT    | `/api/receitas/{id}`   | Atualizar receita       |
| DELETE | `/api/receitas/{id}`   | Excluir receita         |

### Sistema

| Método | Rota                          | Descrição                                                             |
|--------|-------------------------------|-----------------------------------------------------------------------|
| POST   | `/api/sistema/registrar-abertura` | Calcula consumo, atualiza estoque e retorna status de todos os remédios |

---

## 6. Contratos de Requisição e Resposta (exemplos)

### POST `/api/remedios/{id}/receber`
```json
// Request
{
  "quantidadeRecebida": 30,
  "nomeUsuario": "Maria"
}

// Response
{
  "id": 1,
  "nome": "Losartana 50mg",
  "quantidadeAtual": 45,
  "critico": false,
  "diasRestantes": 45
}
```

### POST `/api/sistema/registrar-abertura`
```json
// Response
{
  "diasDecorridos": 3,
  "ultimaAbertura": "2026-05-22T10:00:00",
  "remedios": [
    {
      "id": 1,
      "nome": "Losartana 50mg",
      "quantidadeAtual": 12,
      "quantidadeMinima": 14,
      "diasRestantes": 12,
      "critico": true
    },
    {
      "id": 2,
      "nome": "Atorvastatina 20mg",
      "quantidadeAtual": 25,
      "quantidadeMinima": 7,
      "diasRestantes": 25,
      "critico": false
    }
  ]
}
```

### POST `/api/remedios/{id}/adicionar`
```json
// Request
{
  "quantidade": 20,
  "observacao": "Compra de balcão — sem receita"
}

// Response
{
  "id": 2,
  "nome": "Atorvastatina 20mg",
  "quantidadeAnterior": 5,
  "quantidadeAtual": 25,
  "critico": false
}
```

---

## 7. Stack Tecnológica Recomendada

| Camada      | Tecnologia                      | Justificativa                                          |
|-------------|---------------------------------|--------------------------------------------------------|
| Backend     | ASP.NET Core 8 Web API (C#)     | Nativo no Windows, excelente suporte, tipagem forte    |
| ORM         | Entity Framework Core 8         | Code-first, migrations automáticas, LINQ               |
| Banco       | SQLite                          | Sem necessidade de servidor, arquivo único, portátil   |
| Docs        | Swagger / Scalar                | Interface visual para testar os endpoints              |
| Testes      | xUnit + Moq                     | Padrão do ecossistema .NET                             |

**Por que SQLite?** Por se tratar de uma aplicação de uso pessoal/familiar com volume baixo de dados, o SQLite elimina a necessidade de instalar e manter um servidor de banco de dados.

---

## 8. Estrutura de Pastas (ASP.NET Core)

```
Remedios/
├── src/
│   └── Remedios.Api/
│       ├── Controllers/
│       │   ├── RemediosController.cs
│       │   ├── ReceitasController.cs
│       │   └── SistemaController.cs
│       ├── Models/
│       │   ├── Remedio.cs
│       │   ├── Receita.cs
│       │   └── ControleAbertura.cs
│       ├── DTOs/
│       │   ├── RemedioDto.cs
│       │   ├── ReceitaDto.cs
│       │   └── AberturaSistemaDto.cs
│       ├── Services/
│       │   ├── RemedioService.cs
│       │   ├── ReceitaService.cs
│       │   └── SistemaService.cs
│       ├── Data/
│       │   └── AppDbContext.cs
│       └── Program.cs
└── PLANEJAMENTO.md
```

---

## 9. Pontos em Aberto / Decisões Futuras

| Tema                  | Situação        | Observação                                                                    |
|-----------------------|-----------------|-------------------------------------------------------------------------------|
| Histórico de retiradas | Não previsto    | Se houver necessidade futura, uma entidade `Retirada` pode ser adicionada     |
| Múltiplas receitas por remédio | Não previsto | Modelo atual suporta apenas 1 receita ativa por remédio — suficiente para o escopo |
| Notificações          | Não previsto    | Alertas por e-mail/push podem ser adicionados depois                          |
| Autenticação          | Não necessária  | Aplicação de uso pessoal; sem controle de usuários por enquanto               |
| Frontend              | Não definido    | Swagger/Scalar já permite uso; uma SPA simples pode ser feita depois           |
