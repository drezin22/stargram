using System.Net;
using System.Net.Mail;

namespace Stargram.Api.Services;

public interface IEmailService
{
    Task SendAsync(string to, string subject, string htmlBody);

    // Novo método específico
    Task SendResetPasswordAsync(string toEmail, string resetUrl, TimeSpan expiresIn);
}

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly IWebHostEnvironment _env;

    public EmailService(IConfiguration config, IWebHostEnvironment env)
    {
        _config = config;
        _env = env;
    }

    /* =========================================================
       MÉTODO GENÉRICO (continua funcionando)
       ========================================================= */
    public async Task SendAsync(string to, string subject, string htmlBody)
    {
        var smtp = _config.GetSection("Smtp");

        using var client = new SmtpClient
        {
            Host = smtp["Host"]!,
            Port = int.Parse(smtp["Port"]!),
            EnableSsl = true,
            Credentials = new NetworkCredential(smtp["User"], smtp["Pass"])
        };

        using var msg = new MailMessage
        {
            From = new MailAddress(smtp["From"]!),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true
        };

        msg.To.Add(to);
        await client.SendMailAsync(msg);
    }

    /* =========================================================
       RESET PASSWORD COM TEMPLATE HTML
       ========================================================= */
    public async Task SendResetPasswordAsync(string toEmail, string resetUrl, TimeSpan expiresIn)
    {
        // Caminho do template
        var templatePath = Path.Combine(
            _env.ContentRootPath,
            "EmailTemplates",
            "reset-password.html"
        );

        if (!File.Exists(templatePath))
            throw new FileNotFoundException("Template de e-mail não encontrado.", templatePath);

        var html = await File.ReadAllTextAsync(templatePath);

        // Substituição dos placeholders
        html = html
            .Replace("{{APP_NAME}}", "Stargram")
            .Replace("{{RESET_URL}}", resetUrl)
            .Replace("{{EXPIRES_IN}}", $"{(int)expiresIn.TotalHours} hora")
            .Replace("{{YEAR}}", DateTime.UtcNow.Year.ToString());

        var subject = "Redefinição de senha – Stargram";

        await SendAsync(toEmail, subject, html);
    }
}
