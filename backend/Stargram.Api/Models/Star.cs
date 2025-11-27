namespace Stargram.Api.Models
{
    public class Star
    {
        public int Id { get; set; }
        public string UserName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? DisplayName { get; set; }
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
