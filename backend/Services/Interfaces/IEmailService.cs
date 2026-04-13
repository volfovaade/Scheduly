namespace backend.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendRegistrationConfirmationAsync(string toEmail, string toName);
        Task SendPasswordResetAsync(string toEmail, string toName, string resetToken);
        Task SendEventClosedAsync(string toEmail, string toName, string eventTitle,
            string finalPlace, string finalAddress, DateTimeOffset finalTimeFrom, DateTimeOffset finalTimeTo);
        Task SendFinalVotingReminderAsync(string toEmail, string toName, string eventTitle);
        Task SendEventCancelledAsync(string toEmail, string toName, string eventTitle);
        Task SendDeadlineReminderAsync(string toEmail, string toName, string eventTitle, DateTimeOffset deadline);
        Task SendEventInvitationAsync(string toEmail, string toName, string eventTitle, string eventCode, string organizerName);
    }
}