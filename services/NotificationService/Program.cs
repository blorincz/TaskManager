using MessageContracts;
using MessageContracts.Events;
using Shared;

var builder = WebApplication.CreateBuilder(args);

// Configure RabbitMQ
builder.Services.AddSingleton<IRabbitMQService>(provider =>
{
    var configuration = provider.GetRequiredService<IConfiguration>();
    return new RabbitMQService(
        configuration["RabbitMQ:Host"] ?? "rabbitmq",
        configuration["RabbitMQ:Username"] ?? "admin",
        configuration["RabbitMQ:Password"] ?? "password123");
});

builder.Services.AddHostedService<NotificationBackgroundService>();

var app = builder.Build();

app.MapGet("/", () => "Notification Service is running!");

app.Run();

public class NotificationBackgroundService : BackgroundService
{
    private readonly IRabbitMQService _rabbitMQService;
    private readonly ILogger<NotificationBackgroundService> _logger;

    public NotificationBackgroundService(IRabbitMQService rabbitMQService, ILogger<NotificationBackgroundService> logger)
    {
        _rabbitMQService = rabbitMQService;
        _logger = logger;
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Consume user registration events
        _rabbitMQService.StartConsuming<UserRegisteredEvent>(Queues.UserRegistered, HandleUserRegistered);

        // Consume task assignment events
        _rabbitMQService.StartConsuming<TaskAssignedEvent>(Queues.TaskAssigned, HandleTaskAssigned);

        return Task.CompletedTask;
    }

    private void HandleUserRegistered(UserRegisteredEvent userEvent)
    {
        _logger.LogInformation("Sending welcome email to {Email} for user {Username}",
            userEvent.Email, userEvent.DisplayName);

        // Simulate sending welcome email
        Console.WriteLine($"=== WELCOME EMAIL ===");
        Console.WriteLine($"To: {userEvent.Email}");
        Console.WriteLine($"Subject: Welcome to TaskManager!");
        Console.WriteLine($"Body: Hello {userEvent.DisplayName}, welcome to our platform!");
        Console.WriteLine($"=====================");
    }

    private void HandleTaskAssigned(TaskAssignedEvent taskEvent)
    {
        _logger.LogInformation("Sending task assignment notification for task {TaskId} to user {UserId}",
            taskEvent.TaskId, taskEvent.AssignedTo);

        // Simulate sending notification
        Console.WriteLine($"=== TASK ASSIGNMENT NOTIFICATION ===");
        Console.WriteLine($"Task: {taskEvent.Title}");
        Console.WriteLine($"Assigned To User: {taskEvent.AssignedTo}");
        Console.WriteLine($"Assigned By: {taskEvent.AssignedBy}");
        Console.WriteLine($"===================================");
    }
}