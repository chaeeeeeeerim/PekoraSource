using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Roblox.Libraries.Captcha;
using Roblox.Models.Assets;
using Roblox.Models.Economy;
using Roblox.Models.Users;
using Roblox.Website.Middleware;

namespace Roblox.Website.Controllers;

public sealed class KandiQuickSignupRequest
{
    [Required, StringLength(20, MinimumLength = 3)]
    public string Username { get; set; } = "";
    [Required, StringLength(128, MinimumLength = 3)]
    public string Password { get; set; } = "";
    [Required]
    public string CaptchaToken { get; set; } = "";
}

[ApiController]
[Route("/kandi/v1/auth")]
public sealed class KandiAuthController : ControllerBase
{
    private static bool QuickSignupEnabled =>
        string.Equals(Environment.GetEnvironmentVariable("KANDI_QUICK_SIGNUP_ENABLED"), "true", StringComparison.OrdinalIgnoreCase);

    [HttpGet("signup-config")]
    public IActionResult SignupConfig()
    {
        return Ok(new { enabled = QuickSignupEnabled, siteKey = Roblox.Configuration.HCaptchaPublicKey });
    }

    [HttpPost("signup")]
    public async Task<IActionResult> QuickSignup([FromBody] KandiQuickSignupRequest request)
    {
        if (!QuickSignupEnabled)
            return StatusCode(503, new { message = "Quick signup is disabled on this server." });

        var rawIp = GetRequesterIpRaw(HttpContext);
        var ipKey = ControllerBase.GetIP(rawIp);
        if (!await services.cooldown.TryCooldownCheck("KandiQuickSignupV1:" + ipKey, TimeSpan.FromSeconds(5)))
            return StatusCode(429, new { message = "Too many signup attempts. Wait a few seconds." });
        if (!await services.cooldown.TryIncrementBucketCooldown("KandiQuickSignupCountV1:" + ipKey, 5, TimeSpan.FromHours(1)))
            return StatusCode(429, new { message = "Signup limit reached. Try again later." });

        if (!await HCaptcha.IsValid(rawIp, request.CaptchaToken))
            return BadRequest(new { message = "Security verification failed. Please try again." });
        if (!await services.users.IsUsernameValid(request.Username))
            return BadRequest(new { message = "This username is not valid." });
        if (!await services.users.IsNameAvailableForSignup(request.Username))
            return Conflict(new { message = "This username is already taken." });
        if (!services.users.IsPasswordValid(request.Password))
            return BadRequest(new { message = "This password is not valid." });

        var created = await services.users.CreateUser(request.Username, request.Password, Gender.Unknown);
        // CreateUser initializes 100 Robux (KANBUX). Kandi's starter grant adds 100 Tickets.
        await services.economy.IncrementCurrency(CreatorType.User, created.userId, CurrencyType.Tickets, 100);

        var sessionId = await services.users.CreateSession(created.userId);
        var cookie = SessionMiddleware.CreateJwt(new JwtEntry
        {
            sessionId = sessionId,
            createdAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
        });
        Response.Cookies.Append(SessionMiddleware.CookieName, cookie, new CookieOptions
        {
            Secure = true,
            HttpOnly = true,
            IsEssential = true,
            Path = "/",
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddDays(364)
        });

        return Ok(new { id = created.userId, username = request.Username, kanbux = 100, tix = 100 });
    }
}
