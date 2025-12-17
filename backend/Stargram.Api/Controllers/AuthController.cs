using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Stargram.Api.Data;
using Stargram.Api.Models;
using Stargram.Api.Services;

namespace Stargram.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly AppDbContext _db;
    private readonly IPasswordHasher<AppUser> _hasher;
    private readonly IEmailService _email;

    public AuthController(
        IConfiguration config,
        AppDbContext db,
        IPasswordHasher<AppUser> hasher,
        IEmailService email
    )
    {
        _config = config;
        _db = db;
        _hasher = hasher;
        _email = email;
    }

    // ---------------------------
    // DTOs
    // ---------------------------
    public sealed class LoginRequest
    {
        public string Login { get; set; } = "";
        public string Password { get; set; } = "";
    }

    public sealed class RegisterRequest
    {
        public string Email { get; set; } = "";
        public string UserName { get; set; } = "";
        public string Password { get; set; } = "";
    }

    public sealed class AuthResponse
    {
        public string Token { get; set; } = "";
    }

    public sealed class ForgotPasswordRequest
    {
        public string Email { get; set; } = "";
    }

    public sealed class ResetPasswordRequest
    {
        public string Token { get; set; } = "";
        public string NewPassword { get; set; } = "";
    }

    // ---------------------------
    // REGISTER (normal)
    // ---------------------------
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        var email = (req.Email ?? "").Trim().ToLowerInvariant();
        var userName = (req.UserName ?? "").Trim();

        if (string.IsNullOrWhiteSpace(email) || !email.Contains("@"))
            return BadRequest("E-mail inválido.");

        if (string.IsNullOrWhiteSpace(userName))
            return BadRequest("Nome de usuário inválido.");

        if (string.IsNullOrWhiteSpace(req.Password) || req.Password.Length < 6)
            return BadRequest("A senha deve ter pelo menos 6 caracteres.");

        var emailExists = await _db.Users.AnyAsync(u => u.Email.ToLower() == email);
        if (emailExists)
            return BadRequest("E-mail já cadastrado.");

        var userExists = await _db.Users.AnyAsync(u => u.UserName.ToLower() == userName.ToLower());
        if (userExists)
            return BadRequest("Nome de usuário já está em uso.");

        var user = new AppUser
        {
            Email = email,
            UserName = userName,
            CreatedAt = DateTime.UtcNow,
        };

        user.PasswordHash = _hasher.HashPassword(user, req.Password);

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = CreateJwt(user);
        return Ok(new AuthResponse { Token = token });
    }

    // ---------------------------
    // LOGIN (normal)
    // ---------------------------
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var login = (req.Login ?? "").Trim();
        var password = req.Password ?? "";

        if (string.IsNullOrWhiteSpace(login) || string.IsNullOrWhiteSpace(password))
            return BadRequest("Informe login e senha.");

        var user = await _db.Users.FirstOrDefaultAsync(u =>
            u.Email.ToLower() == login.ToLower() || u.UserName.ToLower() == login.ToLower());

        if (user == null)
            return Unauthorized("Usuário ou senha inválidos.");

        if (string.IsNullOrWhiteSpace(user.PasswordHash))
            return Unauthorized("Essa conta foi criada via Google. Entre com Google ou redefina uma senha.");

        var verify = _hasher.VerifyHashedPassword(user, user.PasswordHash, password);
        if (verify == PasswordVerificationResult.Failed)
            return Unauthorized("Usuário ou senha inválidos.");

        var token = CreateJwt(user);
        return Ok(new AuthResponse { Token = token });
    }

    // ---------------------------
    // FORGOT PASSWORD (ENVIA EMAIL)
    // ---------------------------
    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest req)
    {
        var email = (req.Email ?? "").Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(email) || !email.Contains("@"))
            return Ok();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email);
        if (user == null) return Ok(); // não revela existência

        // invalida tokens antigos ainda válidos
        var old = await _db.PasswordResetTokens
            .Where(t => t.UserId == user.Id && !t.Used && t.ExpiresAt > DateTime.UtcNow)
            .ToListAsync();

        foreach (var t in old) t.Used = true;

        // gera token novo
        var token = Guid.NewGuid().ToString("N");
        var expiresIn = TimeSpan.FromHours(1);
        var expiresAt = DateTime.UtcNow.Add(expiresIn);

        _db.PasswordResetTokens.Add(new PasswordResetToken
        {
            UserId = user.Id,
            Token = token,
            ExpiresAt = expiresAt,
            Used = false
        });

        await _db.SaveChangesAsync();

        // link pro front (com fallback)
        var frontend =
            _config["FrontendUrl"]
            ?? _config["Frontend:BaseUrl"]
            ?? "http://localhost:5173";

        var resetUrl = $"{frontend.TrimEnd('/')}/reset-password?token={token}";

        // ✅ envia usando o template HTML
        await _email.SendResetPasswordAsync(user.Email, resetUrl, expiresIn);

        return Ok();
    }

    // ---------------------------
    // RESET PASSWORD
    // ---------------------------
    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest req)
    {
        var token = (req.Token ?? "").Trim();
        var newPass = req.NewPassword ?? "";

        if (string.IsNullOrWhiteSpace(token))
            return BadRequest("Token inválido.");

        if (string.IsNullOrWhiteSpace(newPass) || newPass.Length < 6)
            return BadRequest("A senha deve ter pelo menos 6 caracteres.");

        var tokenEntity = await _db.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Token == token && !t.Used && t.ExpiresAt > DateTime.UtcNow);

        if (tokenEntity?.User == null)
            return BadRequest("Token inválido ou expirado.");

        var user = tokenEntity.User;
        user.PasswordHash = _hasher.HashPassword(user, newPass);
        tokenEntity.Used = true;

        await _db.SaveChangesAsync();
        return Ok();
    }

    // ---------------------------
    // GOOGLE LOGIN
    // ---------------------------
    [HttpGet("google/login")]
    [AllowAnonymous]
    public IActionResult GoogleLogin()
    {
        var redirectUrl = Url.Action(nameof(GoogleCallback), "Auth", null, Request.Scheme);

        var props = new AuthenticationProperties
        {
            RedirectUri = redirectUrl
        };

        return Challenge(props, GoogleDefaults.AuthenticationScheme);
    }

    // ---------------------------
    // GOOGLE CALLBACK (final)
    // ---------------------------
    [HttpGet("google/callback")]
    [AllowAnonymous]
    public async Task<IActionResult> GoogleCallback()
    {
        var result = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);

        if (!result.Succeeded || result.Principal == null)
            return Redirect("http://localhost:5173/login");

        var principal = result.Principal;

        var email = principal.FindFirstValue(ClaimTypes.Email)?.Trim().ToLowerInvariant();
        var name =
            principal.FindFirstValue(ClaimTypes.Name)
            ?? principal.Identity?.Name
            ?? email;

        if (string.IsNullOrWhiteSpace(email))
            return Redirect("http://localhost:5173/login");

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email);

        if (user == null)
        {
            var baseUserName = (name ?? email).Split('@')[0];
            var uniqueUserName = await GenerateUniqueUserName(baseUserName);

            user = new AppUser
            {
                Email = email,
                UserName = uniqueUserName,
                PasswordHash = null,
                CreatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();
        }

        var token = CreateJwt(user);

        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

        return Redirect($"http://localhost:5173/auth/callback?token={token}");
    }

    // ---------------------------
    // JWT
    // ---------------------------
    private string CreateJwt(AppUser user)
    {
        var jwt = _config.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),

            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.UserName),

            new Claim("userName", user.UserName),
        };

        var token = new JwtSecurityToken(
            issuer: jwt["Issuer"],
            audience: jwt["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<string> GenerateUniqueUserName(string baseName)
    {
        var clean = new string((baseName ?? "user")
            .Trim()
            .ToLowerInvariant()
            .Where(c => char.IsLetterOrDigit(c) || c == '_' || c == '.')
            .ToArray());

        if (string.IsNullOrWhiteSpace(clean))
            clean = "user";

        var candidate = clean;
        var i = 0;

        while (await _db.Users.AnyAsync(u => u.UserName.ToLower() == candidate.ToLower()))
        {
            i++;
            candidate = $"{clean}{i}";
        }

        return candidate;
    }
}
