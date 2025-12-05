// backend/Stargram.Api/Controllers/AuthController.cs
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Stargram.Api.Data;
using Stargram.Api.Models;
using Microsoft.AspNetCore.Authentication.Cookies;


namespace Stargram.Api.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher<AppUser> _passwordHasher;
    private readonly IConfiguration _config;

    public AuthController(
        AppDbContext context,
        IPasswordHasher<AppUser> passwordHasher,
        IConfiguration config)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _config = config;
    }

    // --------------------------------------------------------
    // LOGIN NORMAL (EMAIL + SENHA)
    // POST /auth/login
    // --------------------------------------------------------
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null)
            return Unauthorized("Usuário ou senha inválidos.");

        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash!, request.Password);

        if (result == PasswordVerificationResult.Failed)
            return Unauthorized("Usuário ou senha inválidos.");

        var token = GenerateToken(user);

        return Ok(new AuthResponse
        {
            Token = token,
            Id = user.Id,
            UserName = user.UserName,
            Email = user.Email
        });
    }

    // --------------------------------------------------------
    // REGISTRO NORMAL
    // POST /auth/register
    // --------------------------------------------------------
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var exists = await _context.Users
            .AnyAsync(u => u.Email == request.Email);

        if (exists)
            return BadRequest("Já existe um usuário com esse e-mail.");

        var user = new AppUser
        {
            UserName = request.UserName,
            Email = request.Email,
            CreatedAt = DateTime.UtcNow
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = GenerateToken(user);

        return Ok(new AuthResponse
        {
            Token = token,
            Id = user.Id,
            UserName = user.UserName,
            Email = user.Email
        });
    }

    // --------------------------------------------------------
    // /auth/me  (apenas pra teste - ver usuário logado)
    // --------------------------------------------------------
    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        var id = User.FindFirst("id")?.Value;
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        var username = User.FindFirst("username")?.Value;

        return Ok(new
        {
            Id = id,
            Email = email,
            UserName = username
        });
    }

    // ========================================================
    //          LOGIN COM GOOGLE
    // ========================================================

    // --------------------------------------------------------
    // 1) REDIRECIONA PARA O GOOGLE
    // GET /auth/google/login
    // --------------------------------------------------------
    [HttpGet("google/login")]
    public IActionResult GoogleLogin()
    {
        var redirectUrl = Url.Action("GoogleCallback", "Auth");
        var properties = new AuthenticationProperties { RedirectUri = redirectUrl };

        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    }

    // --------------------------------------------------------
    // 2) CALLBACK DO GOOGLE
    // GET /auth/google/callback
    // --------------------------------------------------------
    [HttpGet("google/callback")]
[AllowAnonymous]
public async Task<IActionResult> GoogleCallback()
{
    // ✅ Agora lê do cookie, não do handler do Google
    var authenticateResult = await HttpContext.AuthenticateAsync(
        CookieAuthenticationDefaults.AuthenticationScheme
    );

    if (!authenticateResult.Succeeded || authenticateResult.Principal == null)
        return Unauthorized("Falha ao autenticar com o Google.");

    var principal = authenticateResult.Principal;

    var email = principal.FindFirst(ClaimTypes.Email)?.Value;
    var name = principal.Identity?.Name ?? email?.Split('@')[0];

    if (string.IsNullOrEmpty(email))
        return BadRequest("Não foi possível obter o e-mail do Google.");

    // 1. Verifica se já existe no banco
    var user = await _context.Users
        .FirstOrDefaultAsync(u => u.Email == email);

    // 2. Se não existir, cria automaticamente
    if (user == null)
    {
        user = new AppUser
        {
            UserName = GenerateUniqueUserName(name!),
            Email = email,
            PasswordHash = null,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
    }

    // 3. Gera o JWT
    var token = GenerateToken(user);

    // 4. Redireciona de volta pro frontend com o token na URL
    var frontendUrl = "http://localhost:5173/auth/callback";
    var redirect = $"{frontendUrl}?token={token}";

    return Redirect(redirect);
}

    // --------------------------------------------------------
    // GERA UM USERNAME ÚNICO A PARTIR DO NOME / E-MAIL
    // --------------------------------------------------------
    private string GenerateUniqueUserName(string baseName)
    {
        var userName = baseName
            .Trim()
            .Replace(" ", ".")
            .ToLowerInvariant();

        if (!_context.Users.Any(u => u.UserName == userName))
            return userName;

        var suffix = 1;
        var temp = userName;

        while (_context.Users.Any(u => u.UserName == temp))
        {
            suffix++;
            temp = $"{userName}{suffix}";
        }

        return temp;
    }

    // --------------------------------------------------------
    // GERA O TOKEN JWT
    // --------------------------------------------------------
    private string GenerateToken(AppUser user)
    {
        var jwtSection = _config.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new("id", user.Id.ToString()),
            new("username", user.UserName),
            new(ClaimTypes.Email, user.Email)
        };

        var token = new JwtSecurityToken(
            issuer: jwtSection["Issuer"],
            audience: jwtSection["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    // ========================================================
    // DTOs
    // ========================================================

    public class LoginRequest
    {
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
    }

    public class RegisterRequest
    {
        public string UserName { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
    }

    public class AuthResponse
    {
        public string Token { get; set; } = default!;
        public int Id { get; set; }
        public string UserName { get; set; } = default!;
        public string Email { get; set; } = default!;
    }
}
