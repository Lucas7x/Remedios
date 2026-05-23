namespace Remedios.Api.Models;

public class Remedio
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Bula { get; set; } = string.Empty;
    public decimal QuantidadeAtual { get; set; }
    public decimal ComprimidosPorDia { get; set; }
    public decimal QuantidadeMinima { get; set; }
    public int? ReceitaId { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;

    public Receita? Receita { get; set; }
}
