using Microsoft.AspNetCore.Mvc;
using Roblox.Website.Filters;

namespace Roblox.Website.Controllers;

/// <summary>
/// Small, stable JSON adapters intended for the Project Kandi frontend.
/// These endpoints reuse the existing Pekora session middleware; they do not
/// create a second authentication mechanism.
/// </summary>
[ApiController]
[Route("/kandi/v1")]
public sealed class KandiAdapterController : ControllerBase
{
    /// <summary>
    /// Returns the current session in the minimal shape required by Kandi's auth.me contract.
    /// </summary>
    [HttpGet("session")]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetSession()
    {
        if (userSession is null)
        {
            return Unauthorized(new
            {
                errors = new[]
                {
                    new { code = 0, message = "You are not signed in." }
                }
            });
        }

        var isStaff = await StaffFilter.IsStaff(userSession.userId);

        return Ok(new
        {
            id = userSession.userId,
            username = userSession.username,
            displayName = userSession.username,
            isStaff
        });
    }
}
