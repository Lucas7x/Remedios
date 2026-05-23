using Microsoft.EntityFrameworkCore;
using Remedios.Api.Data;
using Remedios.Api.DTOs;
using Remedios.Api.Models;

namespace Remedios.Api.Services;

public class RemedioService(AppDbContext db)
{
    public async Task<IEnumerable<RemedioResponse>> ListarAsync()
    {
        var remedios = await db.Remedios.AsNoTracking().ToListAsync();
        return remedios.Select(ToResponse);
    }

    public async Task<RemedioResponse?> BuscarPorIdAsync(int id)
    {
        var remedio = await db.Remedios.AsNoTracking().FirstOrDefaultAsync(r => r.Id == id);
        return remedio is null ? null : ToResponse(remedio);
    }

    public async Task<RemedioResponse> CriarAsync(RemedioCreateRequest request)
    {
        var remedio = new Remedio
        {
            Nome = request.Nome,
            Bula = request.Bula,
            QuantidadeAtual = request.QuantidadeAtual,
            ComprimidosPorDia = request.ComprimidosPorDia,
            QuantidadeMinima = request.QuantidadeMinima,
            ReceitaId = request.ReceitaId
        };

        db.Remedios.Add(remedio);
        await db.SaveChangesAsync();
        return ToResponse(remedio);
    }

    public async Task<RemedioResponse?> AtualizarAsync(int id, RemedioUpdateRequest request)
    {
        var remedio = await db.Remedios.FindAsync(id);
        if (remedio is null) return null;

        remedio.Nome = request.Nome;
        remedio.Bula = request.Bula;
        remedio.ComprimidosPorDia = request.ComprimidosPorDia;
        remedio.QuantidadeMinima = request.QuantidadeMinima;
        remedio.ReceitaId = request.ReceitaId;
        remedio.AtualizadoEm = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return ToResponse(remedio);
    }

    public async Task<bool> ExcluirAsync(int id)
    {
        var remedio = await db.Remedios.FindAsync(id);
        if (remedio is null) return false;

        db.Remedios.Remove(remedio);
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<RemedioResponse?> ReceberAsync(int id, ReceberRemedioRequest request)
    {
        var remedio = await db.Remedios.Include(r => r.Receita).FirstOrDefaultAsync(r => r.Id == id);
        if (remedio is null) return null;

        if (remedio.Receita is not null)
        {
            if (remedio.Receita.DataValidade < DateOnly.FromDateTime(DateTime.Today))
                throw new InvalidOperationException("A receita associada está vencida.");

            remedio.Receita.QuantidadeUsos++;
            remedio.Receita.DataUltimoUso = DateOnly.FromDateTime(DateTime.Today);
            remedio.Receita.NomeUltimoUsuario = request.NomeUsuario;
            remedio.Receita.AtualizadoEm = DateTime.UtcNow;
        }

        remedio.QuantidadeAtual += request.QuantidadeRecebida;
        remedio.AtualizadoEm = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return ToResponse(remedio);
    }

    public async Task<AdicionarComprimidosResponse?> AdicionarComprimidosAsync(int id, AdicionarComprimidosRequest request)
    {
        var remedio = await db.Remedios.FindAsync(id);
        if (remedio is null) return null;

        var anterior = remedio.QuantidadeAtual;
        remedio.QuantidadeAtual += request.Quantidade;
        remedio.AtualizadoEm = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return new AdicionarComprimidosResponse(
            remedio.Id,
            remedio.Nome,
            anterior,
            remedio.QuantidadeAtual,
            remedio.QuantidadeAtual < remedio.QuantidadeMinima
        );
    }

    public async Task AtualizarQuantidadesPorConsumoAsync(int diasDecorridos)
    {
        var remedios = await db.Remedios.ToListAsync();
        foreach (var remedio in remedios)
        {
            var consumo = diasDecorridos * remedio.ComprimidosPorDia;
            remedio.QuantidadeAtual = Math.Max(0, remedio.QuantidadeAtual - consumo);
            remedio.AtualizadoEm = DateTime.UtcNow;
        }
        await db.SaveChangesAsync();
    }

    public static RemedioResponse ToResponse(Remedio r) => new(
        r.Id,
        r.Nome,
        r.Bula,
        r.QuantidadeAtual,
        r.ComprimidosPorDia,
        r.QuantidadeMinima,
        r.ReceitaId,
        r.QuantidadeAtual < r.QuantidadeMinima,
        r.ComprimidosPorDia > 0 ? Math.Round(r.QuantidadeAtual / r.ComprimidosPorDia, 1) : 0
    );
}
