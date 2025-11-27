using Microsoft.EntityFrameworkCore;
using Stargram.Api.Data;

var builder = WebApplication.CreateBuilder(args);

//
// 1. CORS – permite que o frontend (Vite) acesse a API
//
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        name: MyAllowSpecificOrigins,
        policy =>
        {
            policy
                .WithOrigins("http://localhost:5173") // endereço do Vite
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

//
// 2. DbContext – conexão com SQL Server
//
builder.Services.AddDbContext<StargramDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

//
// 3. Controllers
//
builder.Services.AddControllers();

//
// 4. Swagger
//
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

//
// 5. Ativar Swagger no ambiente de desenvolvimento
//
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//
// 6. HTTPS redirection
//
app.UseHttpsRedirection();

//
// 7. ATENÇÃO — ativar CORS ANTES de Authorization
//
app.UseCors(MyAllowSpecificOrigins);

//
// 8. Authorization (não estamos usando ainda)
//
app.UseAuthorization();

//
// 9. Mapear controllers (StarsController etc.)
//
app.MapControllers();

//
// 10. Rodar aplicação
//
app.Run();
