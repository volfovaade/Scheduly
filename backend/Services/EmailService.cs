using backend.Services.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace backend.Services
{
    public class EmailService : IEmailService
    {
        private readonly string _host;
        private readonly int _port;
        private readonly string _user;
        private readonly string _password;
        private readonly string _fromEmail;
        private readonly string _frontendUrl;
        public EmailService()
        {
            _host = Environment.GetEnvironmentVariable("SMTP_HOST")
                ?? throw new InvalidOperationException("SMTP_HOST not configured");
            _port = int.Parse(Environment.GetEnvironmentVariable("SMTP_PORT") ?? "587");
            _user = Environment.GetEnvironmentVariable("SMTP_USER")
                ?? throw new InvalidOperationException("SMTP_USER not configured");
            _password = Environment.GetEnvironmentVariable("SMTP_PASSWORD")
                ?? throw new InvalidOperationException("SMTP_PASSWORD not configured");
            _fromEmail = Environment.GetEnvironmentVariable("EMAIL_FROM") ?? _user;
            _frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:3000";
        }
        private async Task SendAsync(string toEmail, string toName, string subject, string html)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("Scheduly", _fromEmail));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = subject;
            message.Body = new TextPart("html") { Text = html };

            using var client = new SmtpClient();

            // Ignoruj SSL chyby pouze v development prostøedí
            if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
            {
                client.ServerCertificateValidationCallback = (s, c, h, e) => true;
            }

            // Port 465 = SSL, port 587 = STARTTLS
            var socketOptions = _port == 465
                ? SecureSocketOptions.SslOnConnect
                : SecureSocketOptions.StartTls;

            await client.ConnectAsync(_host, _port, socketOptions);
            await client.AuthenticateAsync(_user, _password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
        private string BaseTemplate(string title, string color, string content)
        {
            return $@"
                <div style='font-family:sans-serif;max-width:600px;margin:auto;padding:20px'>
                    <div style='background:{color};padding:24px;border-radius:12px 12px 0 0'>
                        <h1 style='color:white;margin:0;font-size:22px'>{title}</h1>
                    </div>
                    <div style='background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb'>
                        {content}
                        <hr style='border:none;border-top:1px solid #e5e7eb;margin:24px 0'/>
                        <p style='color:#9ca3af;font-size:12px;text-align:center'>
                            Scheduly &mdash; Event Planning Made Easy
                        </p>
                    </div>
                </div>";
        }
        public async Task SendDeadlineReminderAsync(string toEmail, string toName, string eventTitle, DateTimeOffset deadline)
        {
            var content = $@"
                <p>Hi <strong>{toName}</strong>,</p>
                <p>Reminder: the preference submission window for <strong>{eventTitle}</strong> 
                closes on <strong>{deadline:dddd, MMMM d, yyyy}</strong>.</p>
                <p>Make sure you've shared event code and submitted preferences before the deadline!</p>
                <a href='{_frontendUrl}' style='display:inline-block;background:#be185d;color:white;
                    padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold'>
                    View event
                </a>";

            await SendAsync(toEmail, toName, $"Reminder: {eventTitle} deadline approaching",
                BaseTemplate($"Deadline Reminder: {eventTitle}", "#d97706", content));
        }

        public async Task SendEventCancelledAsync(string toEmail, string toName, string eventTitle)
        {
            var content = $@"
                <p>Hi <strong>{toName}</strong>,</p>
                <p>Unfortunately, the event <strong>{eventTitle}</strong> has been cancelled.</p>
                <p style='color:#6b7280'>If you have any questions, please contact the organizer.</p>";

            await SendAsync(toEmail, toName, $"Event cancelled: {eventTitle}",
                BaseTemplate($"Event Cancelled: {eventTitle}", "#dc2626", content));
        }

        public async Task SendEventClosedAsync(string toEmail, string toName, string eventTitle, string finalPlace, string finalAddress, DateTimeOffset finalTimeFrom, DateTimeOffset finalTimeTo)
        {
            var content = $@"
                <p>Hi <strong>{toName}</strong>,</p>
                <p>The event <strong>{eventTitle}</strong> has been finalized!</p>
                <div style='background:white;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0'>
                    <p style='margin:4px 0'><strong>Place:</strong> {finalPlace}</p>
                    <p style='margin:4px 0'><strong>Address:</strong> {finalAddress}</p>
                    <p style='margin:4px 0'><strong>From:</strong> {finalTimeFrom:dddd, MMMM d, yyyy HH:mm}</p>
                    <p style='margin:4px 0'><strong>To:</strong> {finalTimeTo:dddd, MMMM d, yyyy HH:mm}</p>
                </div>
                <p>Don't forget to add it to your calendar!</p>
                <a href='{_frontendUrl}' style='display:inline-block;background:#be185d;color:white;
                    padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold'>
                    View Event
                </a>";

            await SendAsync(toEmail, toName, $"Event finalized: {eventTitle}",
                BaseTemplate($"Event Finalized: {eventTitle}", "#059669", content));
        }

        public async Task SendEventInvitationAsync(string toEmail, string toName, string eventTitle, string eventCode, string organizerName)
        {
            var joinUrl = $"{_frontendUrl}/join/{eventCode}";
            var content = $@"
                <p>Hi <strong>{toName}</strong>,</p>
                <p><strong>{organizerName}</strong> invited you to join <strong>{eventTitle}</strong>.</p>
                <div style='background:white;border:1px solid #e5e7eb;border-radius:8px;
                    padding:20px;margin:16px 0;text-align:center'>
                    <p style='color:#6b7280;margin:0'>Event code</p>
                    <p style='font-size:36px;font-weight:bold;letter-spacing:10px;
                        color:#be185d;margin:8px 0'>{eventCode}</p>
                </div>
                <a href='{joinUrl}' style='display:inline-block;background:#be185d;color:white;
                    padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold'>
                    Join Event
                </a>";

            await SendAsync(toEmail, toName, $"You're invited: {eventTitle}",
                BaseTemplate($"You're Invited: {eventTitle}", "#be185d", content));
        }

        public async Task SendPasswordResetAsync(string toEmail, string toName, string resetToken)
        {
            var resetUrl = $"{_frontendUrl}/resetPassword?token={resetToken}";
            var content = $@"
                <p>Hi <strong>{toName}</strong>,</p>
                <p>We received a request to reset your password. Click the link below &mdash;it expires in <strong>1 hour</strong>.</p>
                <a href='{resetUrl}' style='display:inline-block;background:#be185d;color:white;
                    padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px'>
                    Reset Password
                </a>
                <p style='color:#6b7280;font-size:13px;margin-top:16px'>
                    If you didn't request this, you can safely ignore this email.
                </p>";

            await SendAsync(toEmail, toName, "Password Reset Request",
                BaseTemplate("Password Reset Request", "#374151", content));
        }

        public async Task SendRegistrationConfirmationAsync(string toEmail, string toName)
        {
            var content = $@"
                <p>Hello <strong>{toName}</strong>,</p>
                <p>Your account has been created successfully. Welcome to Scheduly!</p>
                <a href='{_frontendUrl}' style='display:inline-block;background:#be185d;color:white;
                    padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px'>
                    Get Started
                </a>
            ";
            await SendAsync(toEmail, toName, "Welcome to Scheduly!", BaseTemplate("Welcome to Scheduly!", "#be185d", content));
        }
    }
}