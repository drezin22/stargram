// backend/Stargram.Api/Data/AppDbContext.cs
using Microsoft.EntityFrameworkCore;
using Stargram.Api.Models;

namespace Stargram.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<AppUser> Users => Set<AppUser>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<AppUser>(e =>
            {
                e.HasIndex(u => u.Email).IsUnique();
                e.HasIndex(u => u.UserName).IsUnique();
            });
        }
    }
}
