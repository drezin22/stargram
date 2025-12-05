using System.Text;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Stargram.Api.Data;
using Stargram.Api.Models;

var builder = WebApplication.CreateBuilder(args);

// ------------------------------------------------------------
// 1) CORS – liberar o frontend
// ------------------------------------------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173") // Vite
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ------------------------------------------------------------
// 2) EF Core
// ------------------------------------------------------------
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ------------------------------------------------------------
// 3) Hasher de senha
// ------------------------------------------------------------
builder.Services.AddScoped<IPasswordHasher<AppUser>, PasswordHasher<AppUser>>();

// ------------------------------------------------------------
// 4) Autenticação: Cookie (Google) + JWT (API)
// ------------------------------------------------------------
var jwtSection = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSection["Key"]!);

builder.Services
    .AddAuthentication(options =>
    {
        // ✅ API usa JWT como padrão
        options.DefaultAuthenticateScheme  = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme     = JwtBearerDefaults.AuthenticationScheme;

        // ✅ quando o Google precisar “logar” alguém, usa cookie
        options.DefaultSignInScheme        = CookieAuthenticationDefaults.AuthenticationScheme;
    })
    // Cookie SÓ para fluxo externo (Google)
    .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
    {
        options.LoginPath  = "/auth/google/login";
        options.LogoutPath = "/auth/logout";

        options.Cookie.HttpOnly   = true;
        options.Cookie.SameSite   = SameSiteMode.Lax;
        options.Cookie.SecurePolicy = CookieSecurePolicy.None; // DEV: http mesmo
    })
    // JWT para proteger as rotas da API
    .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
    {
        options.RequireHttpsMetadata = false; // DEV
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidIssuer              = jwtSection["Issuer"],
            ValidAudience            = jwtSection["Audience"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey         = new SymmetricSecurityKey(key),
            ClockSkew                = TimeSpan.Zero
        };
    })
    // Login com Google
    .AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
{
    options.ClientId     = builder.Configuration["GoogleAuth:ClientId"]!;
    options.ClientSecret = builder.Configuration["GoogleAuth:ClientSecret"]!;

    // 🔴 Novo caminho de CALLBACK do Google (middleware, NÃO é o controller)
    options.CallbackPath = "/signin-google"; 

    options.CorrelationCookie.SameSite      = SameSiteMode.Lax;
    options.CorrelationCookie.SecurePolicy  = CookieSecurePolicy.None; // DEV: http
    options.CorrelationCookie.HttpOnly      = true;
});

builder.Services.AddAuthorization();

// ------------------------------------------------------------
// 5) Controllers + Swagger
// ------------------------------------------------------------
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ------------------------------------------------------------
// 6) Swagger em DEV
// ------------------------------------------------------------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ------------------------------------------------------------
// 7) Pipeline
// ------------------------------------------------------------

// ❌ DESLIGAR redirecionamento HTTPS em dev,
//    pra não misturar http://5161 com https://7161
// app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
