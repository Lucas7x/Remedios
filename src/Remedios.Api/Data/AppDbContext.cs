using Microsoft.EntityFrameworkCore;
using Remedios.Api.Models;

namespace Remedios.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Remedio> Remedios => Set<Remedio>();
    public DbSet<Receita> Receitas => Set<Receita>();
    public DbSet<ControleAbertura> ControleAbertura => Set<ControleAbertura>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Remedio>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.Property(r => r.Nome).IsRequired().HasMaxLength(200);
            entity.Property(r => r.QuantidadeAtual).HasPrecision(10, 2);
            entity.Property(r => r.ComprimidosPorDia).HasPrecision(10, 2);
            entity.Property(r => r.QuantidadeMinima).HasPrecision(10, 2);
            entity.HasOne(r => r.Receita)
                  .WithMany(rc => rc.Remedios)
                  .HasForeignKey(r => r.ReceitaId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Receita>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.Property(r => r.Descricao).IsRequired().HasMaxLength(500);
            entity.Property(r => r.LocalGuardada).HasMaxLength(300);
            entity.Property(r => r.NomeUltimoUsuario).HasMaxLength(200);
        });

        modelBuilder.Entity<ControleAbertura>(entity =>
        {
            entity.HasKey(c => c.Id);
            // Seed com registro inicial único
            entity.HasData(new ControleAbertura { Id = 1, UltimaAbertura = DateTime.UtcNow });
        });
    }
}
