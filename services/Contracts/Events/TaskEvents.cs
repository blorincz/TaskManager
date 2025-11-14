namespace MessageContracts.Events;

public record TaskCreatedEvent
{
    public Guid TaskId { get; init; }
    public string Title { get; init; } = string.Empty;
    public Guid CreatedBy { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record TaskAssignedEvent
{
    public Guid TaskId { get; init; }
    public string Title { get; init; } = string.Empty;
    public Guid AssignedTo { get; init; }
    public Guid AssignedBy { get; init; }
    public DateTime AssignedAt { get; init; }
}

public record TaskCompletedEvent
{
    public Guid TaskId { get; init; }
    public string Title { get; init; } = string.Empty;
    public Guid CompletedBy { get; init; }
    public DateTime CompletedAt { get; init; }
}
