// backend/Stargram.Api/Models/AppUser.cs
using System;

namespace Stargram.Api.Models
{
    public class AppUser
    {
        public int Id { get; set; }

        public string UserName { get; set; } = default!;

        public string Email { get; set; } = default!;

        // hash da senha, nunca guarde senha em texto puro
        public string? PasswordHash { get; set; } = default!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
