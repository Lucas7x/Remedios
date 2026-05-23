using Microsoft.AspNetCore.Mvc;
using Remedios.Api.Services;

namespace Remedios.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SistemaController(SistemaService service) : ControllerBase
{
    [HttpPost("registrar-abertura")]
    public async Task<IActionResult> RegistrarAbertura()
    {
        var resultado = await service.RegistrarAberturaAsync();
        return Ok(resultado);
    }
}
