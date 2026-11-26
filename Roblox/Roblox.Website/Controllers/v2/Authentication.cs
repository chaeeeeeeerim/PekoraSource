using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Roblox.Exceptions;
using Roblox.Models.Sessions;
using Roblox.Models.Users;
using Roblox.Services;
using Roblox.Services.App.FeatureFlags;
using Roblox.Services.Exceptions;
using Roblox.Website.WebsiteModels;
using Roblox.Website.WebsiteModels.Authentication;
using BadRequestException = Roblox.Exceptions.BadRequestException;
using ServiceProvider = Microsoft.Extensions.DependencyInjection.ServiceProvider;

namespace Roblox.Website.Controllers;

[ApiController]
[Route("/apisite/auth/v2")]
public class AuthenticationControllerV2 : ControllerBase
{
    [HttpGet("metadata")]
    public dynamic GetMetadata()
    {
        return new
        {
            cookieLawNoticeTimeout = 20 * 1000,
        };
    }

    [HttpGet("passwords/current-status")]
    public dynamic GetPasswordStatus()
    {
        return new
        {
            valid = true,
        };
    }

    [HttpPost("user/passwords/change")]
    public async Task ChangePassword([Required, FromBody] ChangePasswordRequest request)
    {
        FeatureFlags.FeatureCheck(FeatureFlag.ChangePasswordEnabled);
        var passwordOk = services.users.IsPasswordValid(request.newPassword);
        if (!passwordOk)
        {
            throw new BadRequestException(0, "Invalid password");
        }
        // Pass cooldown check
        if (!await services.cooldown.TryCooldownCheck("change password " + safeUserSession.userId,
                TimeSpan.FromMinutes(1)))
            throw new RobloxException(429, 0, "TooManyRequests");
        // Verify password
        var correctPass = await services.users.VerifyPassword(safeUserSession.userId, request.currentPassword);
        if (!correctPass)
        {
            throw new BadRequestException(8, "Password does not match");
        }
        // We can update the user's password now
        await services.users.UpdatePassword(safeUserSession.userId, request.newPassword);
    }

    [HttpPost("logout"), HttpPost("/api/auth/logout")]
    public async Task Logout()
    {
        await services.users.DeleteSession(safeUserSession.sessionId);
        using var sessCache = Roblox.Services.ServiceProvider.GetOrCreate<UserSessionsCache>();
        sessCache.Remove(safeUserSession.sessionId);
        HttpContext.Response.Cookies.Delete(Middleware.SessionMiddleware.CookieName);
    }

    private async Task CreateSessionAndSetCookie(long userId)
    {
        var sessionId = await services.users.CreateSession(userId);
        var cookie = Middleware.SessionMiddleware.CreateJwt(new Middleware.JwtEntry
        {
            sessionId = sessionId,
            createdAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
        });
        Response.Cookies.Append(Middleware.SessionMiddleware.CookieName, cookie, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            IsEssential = true,
            Path = "/",
            Expires = DateTimeOffset.UtcNow.AddDays(364),
        });
    }

    [HttpPost("login"), HttpPost("/api/auth/login")]
    public async Task<IActionResult> Login([Required, FromBody] LoginRequest request)
    {
        var username = string.IsNullOrWhiteSpace(request.username) ? request.cvalue : request.username;
        if (!string.IsNullOrWhiteSpace(request.ctype) && request.ctype != "username")
            throw new BadRequestException(0, "Only username login is supported.");
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(request.password))
            throw new BadRequestException(0, "Username and password are required.");

        long userId;
        try
        {
            userId = await services.users.GetUserIdFromUsername(username.Trim());
        }
        catch (RecordNotFoundException)
        {
            throw new ForbiddenException(1, "Incorrect username or password. Please try again.");
        }

        if (!await services.users.VerifyPassword(userId, request.password))
            throw new ForbiddenException(1, "Incorrect username or password. Please try again.");

        await CreateSessionAndSetCookie(userId);
        var user = await services.users.GetUserById(userId);
        return Ok(new { user = new { userId, username = user.username } });
    }

    [HttpPost("signup"), HttpPost("/api/auth/signup")]
    public async Task<IActionResult> Signup([Required, FromBody] SignUpRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.username) || string.IsNullOrWhiteSpace(request.password))
            throw new BadRequestException(0, "Username and password are required.");

        var signupKey = "kandi:quick-signup:" + GetIP();
        if (!await services.cooldown.TryCooldownCheck(signupKey, TimeSpan.FromSeconds(10)))
            throw new RobloxException(429, 0, "Too many signup attempts. Please wait a moment.");

        var username = request.username.Trim();
        if (!await services.users.IsUsernameValid(username))
            throw new BadRequestException(5, "Invalid username.");
        if (!await services.users.IsNameAvailableForSignup(username))
            throw new ForbiddenException(6, "Username is already taken.");
        if (!services.users.IsPasswordValid(request.password))
            throw new BadRequestException(9, "Password is too simple.");

        var createdUser = await services.users.CreateUser(username, request.password, Gender.Unknown);
        await CreateSessionAndSetCookie(createdUser.userId);
        return Ok(new { user = new { userId = createdUser.userId, username } });
    }

    [HttpGet("me"), HttpGet("/api/auth/me")]
    public async Task<dynamic> Me()
    {
        var session = safeUserSession;
        var balance = await services.economy.GetUserBalance(session.userId);
        return new
        {
            userId = session.userId,
            username = session.username,
            currency = balance.robux,
            robux = balance.robux,
            tickets = balance.tickets,
        };
    }

    [HttpPost("logoutfromallsessionsandreauthenticate")]
    public async Task LogoutFromAllSessionsAndReAuthenticate()
    {
        // We don't actually re authenticate (for security).
        await services.users.ExpireAllSessions(safeUserSession.userId);
        // remove current session immediately
        using var sessCache = Roblox.Services.ServiceProvider.GetOrCreate<UserSessionsCache>();
        sessCache.Remove(safeUserSession.sessionId);
    }
}