using Microsoft.EntityFrameworkCore;
using Remedios.Api.Data;
using Remedios.Api.DTOs;
using Remedios.Api.Models;

namespace Remedios.Api.Services;

public class SistemaService(AppDbContext db, RemedioService remedioService)
{
    public async Task<AberturaSistemaResponse> RegistrarAberturaAsync()
    {
        var controle = await db.ControleAbertura.FindAsync(1)
            ?? new ControleAbertura { Id = 1, UltimaAbertura = DateTime.UtcNow };

        var agora = DateTime.UtcNow;
        var diasDecorridos = (int)(agora - controle.UltimaAbertura).TotalDays;

        if (diasDecorridos > 0)
            await remedioService.AtualizarQuantidadesPorConsumoAsync(diasDecorridos);

        controle.UltimaAbertura = agora;

        if (db.Entry(controle).State == EntityState.Detached)
            db.ControleAbertura.Add(controle);

        await db.SaveChangesAsync();

        var remedios = await db.Remedios.AsNoTracking().ToListAsync();

        return new AberturaSistemaResponse(
            diasDecorridos,
            agora,
            remedios.Select(RemedioService.ToResponse)
        );
    }
}
