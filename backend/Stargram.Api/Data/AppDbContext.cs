// backend/Stargram.Api/Data/AppDbContext.cs
using Microsoft.EntityFrameworkCore;
using Stargram.Api.Models;

namespace Stargram.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<AppUser> Users => Set<AppUser>();

        // 🔹 NOVO DbSet
        public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<AppUser>(e =>
            {
                e.HasIndex(u => u.Email).IsUnique();
                e.HasIndex(u => u.UserName).IsUnique();
            });

            // 🔹 Relacionamento PasswordResetToken → AppUser
            modelBuilder.Entity<PasswordResetToken>(e =>
            {
                e.HasOne(t => t.User)
                 .WithMany() // AppUser não precisa de coleção agora
                 .HasForeignKey(t => t.UserId)
                 .OnDelete(DeleteBehavior.Cascade);

                e.HasIndex(t => t.Token).IsUnique();
            });
        }
    }
}
