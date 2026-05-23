namespace Remedios.Api.DTOs;

public record RemedioResponse(
    int Id,
    string Nome,
    string Bula,
    decimal QuantidadeAtual,
    decimal ComprimidosPorDia,
    decimal QuantidadeMinima,
    int? ReceitaId,
    bool Critico,
    decimal DiasRestantes
);

public record RemedioCreateRequest(
    string Nome,
    string Bula,
    decimal QuantidadeAtual,
    decimal ComprimidosPorDia,
    decimal QuantidadeMinima,
    int? ReceitaId
);

public record RemedioUpdateRequest(
    string Nome,
    string Bula,
    decimal ComprimidosPorDia,
    decimal QuantidadeMinima,
    int? ReceitaId
);

public record ReceberRemedioRequest(
    decimal QuantidadeRecebida,
    string NomeUsuario
);

public record AdicionarComprimidosRequest(
    decimal Quantidade,
    string? Observacao
);

public record AdicionarComprimidosResponse(
    int Id,
    string Nome,
    decimal QuantidadeAnterior,
    decimal QuantidadeAtual,
    bool Critico
);
