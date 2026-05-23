namespace Remedios.Api.Models;

public class ControleAbertura
{
    public int Id { get; set; } = 1;
    public DateTime UltimaAbertura { get; set; } = DateTime.UtcNow;
}
