using Microsoft.EntityFrameworkCore;
using Remedios.Api.Data;
using Remedios.Api.DTOs;
using Remedios.Api.Models;

namespace Remedios.Api.Services;

public class ReceitaService(AppDbContext db)
{
    public async Task<IEnumerable<ReceitaResponse>> ListarAsync()
    {
        var receitas = await db.Receitas.Include(r => r.Remedios).AsNoTracking().ToListAsync();
        return receitas.Select(ToResponse);
    }

    public async Task<ReceitaResponse?> BuscarPorIdAsync(int id)
    {
        var receita = await db.Receitas.Include(r => r.Remedios).AsNoTracking().FirstOrDefaultAsync(r => r.Id == id);
        return receita is null ? null : ToResponse(receita);
    }

    public async Task<ReceitaResponse> CriarAsync(ReceitaCreateRequest request)
    {
        var receita = new Receita
        {
            Descricao = request.Descricao,
            DataEmissao = request.DataEmissao,
            DataValidade = request.DataValidade,
            LocalGuardada = request.LocalGuardada
        };

        db.Receitas.Add(receita);
        await db.SaveChangesAsync();
        return ToResponse(receita);
    }

    public async Task<ReceitaResponse?> AtualizarAsync(int id, ReceitaUpdateRequest request)
    {
        var receita = await db.Receitas.Include(r => r.Remedios).FirstOrDefaultAsync(r => r.Id == id);
        if (receita is null) return null;

        receita.Descricao = request.Descricao;
        receita.DataEmissao = request.DataEmissao;
        receita.DataValidade = request.DataValidade;
        receita.LocalGuardada = request.LocalGuardada;
        receita.Devolvida = request.Devolvida;
        receita.AtualizadoEm = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return ToResponse(receita);
    }

    public async Task<bool> ExcluirAsync(int id)
    {
        var receita = await db.Receitas.FindAsync(id);
        if (receita is null) return false;

        db.Receitas.Remove(receita);
        await db.SaveChangesAsync();
        return true;
    }

    private static ReceitaResponse ToResponse(Receita r) => new(
        r.Id,
        r.Descricao,
        r.DataEmissao,
        r.DataValidade,
        r.QuantidadeUsos,
        r.DataUltimoUso,
        r.NomeUltimoUsuario,
        r.LocalGuardada,
        r.Devolvida,
        r.DataValidade < DateOnly.FromDateTime(DateTime.Today),
        r.Remedios.Select(rem => rem.Nome)
    );
}
