using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Remedios.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ControleAbertura",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UltimaAbertura = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ControleAbertura", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Receitas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Descricao = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    DataEmissao = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    DataValidade = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    QuantidadeUsos = table.Column<int>(type: "INTEGER", nullable: false),
                    DataUltimoUso = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    NomeUltimoUsuario = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    LocalGuardada = table.Column<string>(type: "TEXT", maxLength: 300, nullable: false),
                    Devolvida = table.Column<bool>(type: "INTEGER", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "TEXT", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Receitas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Remedios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nome = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Bula = table.Column<string>(type: "TEXT", nullable: false),
                    QuantidadeAtual = table.Column<decimal>(type: "TEXT", precision: 10, scale: 2, nullable: false),
                    ComprimidosPorDia = table.Column<decimal>(type: "TEXT", precision: 10, scale: 2, nullable: false),
                    QuantidadeMinima = table.Column<decimal>(type: "TEXT", precision: 10, scale: 2, nullable: false),
                    ReceitaId = table.Column<int>(type: "INTEGER", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "TEXT", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Remedios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Remedios_Receitas_ReceitaId",
                        column: x => x.ReceitaId,
                        principalTable: "Receitas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.InsertData(
                table: "ControleAbertura",
                columns: new[] { "Id", "UltimaAbertura" },
                values: new object[] { 1, new DateTime(2026, 5, 23, 3, 5, 50, 257, DateTimeKind.Utc).AddTicks(7559) });

            migrationBuilder.CreateIndex(
                name: "IX_Remedios_ReceitaId",
                table: "Remedios",
                column: "ReceitaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ControleAbertura");

            migrationBuilder.DropTable(
                name: "Remedios");

            migrationBuilder.DropTable(
                name: "Receitas");
        }
    }
}
