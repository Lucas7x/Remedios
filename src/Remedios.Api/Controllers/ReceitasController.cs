using Microsoft.AspNetCore.Mvc;
using Remedios.Api.DTOs;
using Remedios.Api.Services;

namespace Remedios.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReceitasController(ReceitaService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar() => Ok(await service.ListarAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> BuscarPorId(int id)
    {
        var receita = await service.BuscarPorIdAsync(id);
        return receita is null ? NotFound() : Ok(receita);
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] ReceitaCreateRequest request)
    {
        var receita = await service.CriarAsync(request);
        return CreatedAtAction(nameof(BuscarPorId), new { id = receita.Id }, receita);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Atualizar(int id, [FromBody] ReceitaUpdateRequest request)
    {
        var receita = await service.AtualizarAsync(id, request);
        return receita is null ? NotFound() : Ok(receita);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Excluir(int id)
    {
        var excluido = await service.ExcluirAsync(id);
        return excluido ? NoContent() : NotFound();
    }
}
