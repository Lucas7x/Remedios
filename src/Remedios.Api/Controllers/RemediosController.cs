using Microsoft.AspNetCore.Mvc;
using Remedios.Api.DTOs;
using Remedios.Api.Services;

namespace Remedios.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RemediosController(RemedioService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar() => Ok(await service.ListarAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> BuscarPorId(int id)
    {
        var remedio = await service.BuscarPorIdAsync(id);
        return remedio is null ? NotFound() : Ok(remedio);
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] RemedioCreateRequest request)
    {
        var remedio = await service.CriarAsync(request);
        return CreatedAtAction(nameof(BuscarPorId), new { id = remedio.Id }, remedio);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Atualizar(int id, [FromBody] RemedioUpdateRequest request)
    {
        var remedio = await service.AtualizarAsync(id, request);
        return remedio is null ? NotFound() : Ok(remedio);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Excluir(int id)
    {
        var excluido = await service.ExcluirAsync(id);
        return excluido ? NoContent() : NotFound();
    }

    [HttpPost("{id:int}/receber")]
    public async Task<IActionResult> Receber(int id, [FromBody] ReceberRemedioRequest request)
    {
        try
        {
            var remedio = await service.ReceberAsync(id, request);
            return remedio is null ? NotFound() : Ok(remedio);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { erro = ex.Message });
        }
    }

    [HttpPost("{id:int}/adicionar")]
    public async Task<IActionResult> Adicionar(int id, [FromBody] AdicionarComprimidosRequest request)
    {
        var resultado = await service.AdicionarComprimidosAsync(id, request);
        return resultado is null ? NotFound() : Ok(resultado);
    }
}
