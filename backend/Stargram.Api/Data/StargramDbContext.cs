using Microsoft.EntityFrameworkCore;
using Stargram.Api.Models;

namespace Stargram.Api.Data
{
    public class StargramDbContext : DbContext
    {
        public StargramDbContext(DbContextOptions<StargramDbContext> options)
            : base(options)
        {
        }

        public DbSet<Star> Stars { get; set; }
    }
}
