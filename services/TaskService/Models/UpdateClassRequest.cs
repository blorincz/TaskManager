using System.ComponentModel.DataAnnotations;

namespace TaskService.Models;

public class UpdateTaskRequest
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    public string Status { get; set; } = string.Empty;

    public Guid? AssigneeId { get; set; }

    public int Priority { get; set; }

    public DateTime? DueDate { get; set; }
}