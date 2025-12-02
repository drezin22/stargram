// backend/Stargram.Api/Controllers/AuthController.cs
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Stargram.Api.Data;
using Stargram.Api.Models;

namespace Stargram.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IPasswordHasher<AppUser> _hasher;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext db, IPasswordHasher<AppUser> hasher, IConfiguration config)
        {
            _db = db;
            _hasher = hasher;
            _config = config;
        }

        public record RegisterDto(string UserName, string Email, string Password);
        public record LoginDto(string EmailOrUserName, string Password);

        public record AuthResponse(int Id, string UserName, string Email, string Token);

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterDto dto)
        {
            dto = dto with
            {
                UserName = dto.UserName.Trim(),
                Email = dto.Email.Trim().ToLower()
            };

            if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest("E-mail já cadastrado.");

            if (await _db.Users.AnyAsync(u => u.UserName == dto.UserName))
                return BadRequest("Nome de usuário já está em uso.");

            var user = new AppUser
            {
                UserName = dto.UserName,
                Email = dto.Email
            };

            user.PasswordHash = _hasher.HashPassword(user, dto.Password);

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            var token = GenerateToken(user);

            return Ok(new AuthResponse(user.Id, user.UserName, user.Email, token));
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginDto dto)
        {
            var login = dto.EmailOrUserName.Trim();

            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Email == login || u.UserName == login);

            if (user == null)
                return Unauthorized("Usuário ou senha inválidos.");

            var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
            if (result == PasswordVerificationResult.Failed)
                return Unauthorized("Usuário ou senha inválidos.");

            var token = GenerateToken(user);

            return Ok(new AuthResponse(user.Id, user.UserName, user.Email, token));
        }

        private string GenerateToken(AppUser user)
        {
            var jwtSection = _config.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection["Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("username", user.UserName)
            };

            var token = new JwtSecurityToken(
                issuer: jwtSection["Issuer"],
                audience: jwtSection["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(12),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
