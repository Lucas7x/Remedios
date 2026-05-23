namespace Remedios.Api.Models;

public class Receita
{
    public int Id { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public DateOnly DataEmissao { get; set; }
    public DateOnly DataValidade { get; set; }
    public int QuantidadeUsos { get; set; }
    public DateOnly? DataUltimoUso { get; set; }
    public string? NomeUltimoUsuario { get; set; }
    public string LocalGuardada { get; set; } = string.Empty;
    public bool Devolvida { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;

    public ICollection<Remedio> Remedios { get; set; } = new List<Remedio>();
}
