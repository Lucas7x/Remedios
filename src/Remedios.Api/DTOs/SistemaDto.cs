namespace Remedios.Api.DTOs;

public record AberturaSistemaResponse(
    int DiasDecorridos,
    DateTime UltimaAbertura,
    IEnumerable<RemedioResponse> Remedios
);
