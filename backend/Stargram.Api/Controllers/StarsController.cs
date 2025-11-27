using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stargram.Api.Data;
using Stargram.Api.Models;

namespace Stargram.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StarsController : ControllerBase
    {
        private readonly StargramDbContext _context;

        public StarsController(StargramDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Star>>> GetAll()
        {
            return await _context.Stars.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Star>> Create(Star star)
        {
            star.CreatedAt = DateTime.UtcNow;

            _context.Stars.Add(star);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { id = star.Id }, star);
        }
    }
}
