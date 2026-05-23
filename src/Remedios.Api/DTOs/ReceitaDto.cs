namespace Remedios.Api.DTOs;

public record ReceitaResponse(
    int Id,
    string Descricao,
    DateOnly DataEmissao,
    DateOnly DataValidade,
    int QuantidadeUsos,
    DateOnly? DataUltimoUso,
    string? NomeUltimoUsuario,
    string LocalGuardada,
    bool Devolvida,
    bool Vencida,
    IEnumerable<string> NomesRemedios
);

public record ReceitaCreateRequest(
    string Descricao,
    DateOnly DataEmissao,
    DateOnly DataValidade,
    string LocalGuardada
);

public record ReceitaUpdateRequest(
    string Descricao,
    DateOnly DataEmissao,
    DateOnly DataValidade,
    string LocalGuardada,
    bool Devolvida
);
