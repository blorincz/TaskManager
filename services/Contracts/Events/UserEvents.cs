namespace MessageContracts.Events;

public record UserRegisteredEvent
{
    public Guid UserId { get; init; }
    public string DisplayName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public DateTime RegisteredAt { get; init; }
}

public record UserProfileUpdatedEvent
{
    public Guid UserId { get; init; }
    public string? DisplayName { get; init; }
    public DateTime UpdatedAt { get; init; }
}